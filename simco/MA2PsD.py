import numpy as np
import matplotlib.pyplot as plt

plt.rcParams['text.usetex'] = True

plt.style.use('dark_background')

# ---- knobs to play with ----------------------------------------------------
N = 2000                                   # number of sample points
PARAMS = [(0.0, 0.0), (0.8, 0.5), (-0.8, 0.5)]   # (theta1, theta2) for each panel
SIGMA = 1.0                                # noise std
SEED = 0
SHOW_THEORY_ELLIPSOID = True               # overlay 2-sigma ellipsoid of the true law
ELEV, AZIM = 20, 35                        # camera angle
# ----------------------------------------------------------------------------

rng = np.random.default_rng(SEED)


def simulate_ma2(t1, t2, n, sigma, rng):
    """Y_t = e_t + t1 e_{t-1} + t2 e_{t-2}, e_t ~ N(0, sigma^2). Returns n points."""
    e = rng.normal(0.0, sigma, n + 2)
    return e[2:] + t1 * e[1:-1] + t2 * e[:-2]


def triples(y):
    """Rows (Y_t, Y_{t-1}, Y_{t-2})."""
    return np.column_stack([y[2:], y[1:-1], y[:-2]])


def theory_cov(t1, t2, sigma):
    g0 = sigma**2 * (1 + t1**2 + t2**2)
    g1 = sigma**2 * (t1 + t1 * t2)
    g2 = sigma**2 * t2
    return np.array([[g0, g1, g2], [g1, g0, g1], [g2, g1, g0]])


def ellipsoid_surface(cov, k=2.0, m=30):
    vals, vecs = np.linalg.eigh(cov)
    u, v = np.meshgrid(np.linspace(0, 2 * np.pi, m), np.linspace(0, np.pi, m // 2))
    sph = np.stack([np.cos(u) * np.sin(v), np.sin(u) * np.sin(v), np.cos(v)])
    pts = vecs @ (np.sqrt(vals)[:, None] * k * sph.reshape(3, -1))
    return pts.reshape(3, *u.shape)


# same cube for every panel (3D analogue of sharey)
lim = 2.3 * SIGMA * np.sqrt(1 + max(p[0]**2 + p[1]**2 for p in PARAMS) + 1e-9) * 1.15

fig = plt.figure(figsize=(15, 6))
for i, (t1, t2) in enumerate(PARAMS, start=1):
    ax = fig.add_subplot(1, 3, i, projection='3d')
    y = simulate_ma2(t1, t2, N + 2, SIGMA, rng)
    X = triples(y)
    ax.scatter(X[:, 1], X[:, 2], X[:, 0], s=5, alpha=0.70, edgecolor='none')
    
    ax.xaxis.set_pane_color((0, 0, 0, 0))
    ax.yaxis.set_pane_color((0, 0, 0, 0))
    ax.zaxis.set_pane_color((0.5, 0.5, 0.5, 0.2))

    # Fainter gridlines
    ax.xaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.2)
    ax.yaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.2)
    ax.zaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.3)

    if SHOW_THEORY_ELLIPSOID:
        # cov is in order (Y_t, Y_{t-1}, Y_{t-2}); plot order is (Y_{t-1}, Y_{t-2}, Y_t)
        cov = theory_cov(t1, t2, SIGMA)
        P = [1, 2, 0]
        xs, ys, zs = ellipsoid_surface(cov[np.ix_(P, P)])
        ax.plot_wireframe(xs, ys, zs, color='yellow', lw=0.5, alpha=0.3)

    g = theory_cov(t1, t2, SIGMA)
    r1, r2 = g[0, 1] / g[0, 0], g[0, 2] / g[0, 0]
    ax.set_title(rf'$\theta_1={t1:g},\ \theta_2={t2:g}$' '\n'
                 rf'$\rho_1={r1:.2f},\ \rho_2={r2:.2f}$')
    ax.set_xlabel(r'$Y_{t-1}$')
    ax.set_ylabel(r'$Y_{t-2}$')
    ax.set_zlabel(r'$Y_t$')
    ax.set_xlim(-lim, lim); ax.set_ylim(-lim, lim); ax.set_zlim(-lim, lim)
    ax.set_box_aspect((1, 1, 1))
    ax.view_init(elev=ELEV, azim=AZIM)


# fig.suptitle(r'Phase space of MA(2): $Y_t = \varepsilon_t + \theta_1\varepsilon_{t-1}'
#              rf'+ \theta_2\varepsilon_{{t-2}}$, $N={N}$')
plt.tight_layout()
plt.show()

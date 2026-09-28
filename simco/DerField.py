import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint

plt.style.use('dark_background')

# Oscillator parameters
omega = 2
zeta = 0.15

#3D grid in (t, x1, x2) space
t = np.linspace(0, 10, 5)
x1 = np.linspace(-3, 3, 6)
x2 = np.linspace(-3, 3, 6)
T, X1, X2 = np.meshgrid(t, x1, x2)

U = np.ones_like(T)                                # dt/dt = 1
V = X2                                             # dx1/dt = x2
W = -2*zeta*omega*X2 - omega**2 * X1               # dx2/dt = -2ζω x2 - ω²x1

fig = plt.figure(figsize=(8, 8))
ax = fig.add_subplot(111, projection='3d')
#this controls the walls xy-yz-zx
ax.xaxis.set_pane_color((0, 0, 0, 0))
ax.yaxis.set_pane_color((0, 0, 0, 0))
ax.zaxis.set_pane_color((0.5, 0.5, 0.5, 0.2))

# Fainted gridlines
ax.xaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.2)
ax.yaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.2)
ax.zaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.3)
ax.quiver(
    T, X1, X2, U, V, W, 
    normalize=True,
    length=1.2,        #once normalized we may want to scale the vectors. 
    color='lime', 
    alpha=0.5)

#Solution trajectory
def system(state, t):
    x1, x2 = state
    dx1_dt = x2
    dx2_dt = -2*zeta*omega*x2 - omega**2 * x1
    return [dx1_dt, dx2_dt]

t_curve = np.linspace(0, 10, 300)
initial_state = [3, 0]                                # x1(0)=3, x2(0)=0



#Now solution holds the entire trajectory, computed at all 300 time points at once (hence 3rd argument is t_curve) — but recall: shape 300x2 — 300 rows (one per time value), 2 columns (one per state variable), since you have two coupled equations.
#solution[:,0] means take all rows of 0-th col
#solution[:,1] means take all rows of 1-st col

solution = odeint(system, initial_state, t_curve)     #odeint is applying the system itertively to the initial condition at points in t_curve.
x1_curve = solution[:, 0]
x2_curve = solution[:, 1]

ax.plot(t_curve, x1_curve, x2_curve, color='red', linewidth=2)    #plots the points of t_curve in a col, thenpoints of x1, then x2 ~ like a 300x3 matrix

ax.set_title(r"Phase space: $x'' + 2\zeta\omega x' + \omega^2 x = 0$", color='white')
ax.set_xlabel("t")
ax.set_ylabel("x_1")
ax.set_zlabel("x_2")

plt.show()
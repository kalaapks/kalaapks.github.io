import numpy as np
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter

plt.style.use('dark_background')

# ============================================================
# CONTROLS
# ============================================================
n_paths = 10     # number of paths (try 1, 10, 100, 1000)
n_time = 200     # number of time points in each path
seed = 42        # same seed = same random numbers every run
y_limit = 10     # y-axis shown from -y_limit to +y_limit (use None to see raw Cauchy spikes)

np.random.seed(seed)
t = np.arange(n_time)

# More paths -> more transparent lines, so the plot stays readable
if n_paths <= 10:
    line_alpha = 0.8
elif n_paths <= 100:
    line_alpha = 0.3
else:
    line_alpha = 0.08

# ============================================================
# Generate the data (each row = one path, each column = one time point)
# ============================================================
gaussian_noise = np.random.normal(loc=0, scale=1, size=(n_paths, n_time))
cauchy_noise = np.random.standard_cauchy(size=(n_paths, n_time))

# ============================================================
# Plot: Gaussian vs Cauchy on the same y-axis
# ============================================================
fig, axes = plt.subplots(1, 2, figsize=(12, 4), sharey=True)
ax_gau, ax_cau = axes

for i in range(n_paths):
    ax_gau.plot(t, gaussian_noise[i, :], alpha=line_alpha, linewidth=1)
    ax_cau.plot(t, cauchy_noise[i, :], alpha=line_alpha, linewidth=1)

ax_gau.set_title("Gaussian N(0,1) (stationary)")
ax_cau.set_title("Cauchy(0,1)")

if y_limit is not None:
    ax_gau.set_ylim(-y_limit, y_limit)    # sharey=True applies this to both

comma_format = FuncFormatter(lambda v, pos: f'{v:,.10g}')   # 10000 -> 10,000

for ax in axes:
    ax.axhline(0, color="black", linewidth=0.8)             # reference line at 0
    ax.set_xlabel("time t")
    ax.yaxis.set_major_formatter(comma_format)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

ax_gau.set_ylabel("Y_t")

plt.tight_layout()
plt.show()
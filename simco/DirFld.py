import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint    #for plotting integral curves


plt.style.use('dark_background')

x = np.linspace(-5, 5, 20)
y = np.linspace(-1, 5, 20)
X, Y = np.meshgrid(x, y)

def f_odeint(y, x):
    return -x / y

# Avoid division by zero: replace Y values very close to 0
Y_safe = np.where(np.abs(Y) < 1e-6, 1e-6, Y)


U = np.ones_like(X)      # run = 1 everywhere (more in the end)
V = - X / Y_safe
N = np.sqrt(U**2 + V**2)   # magnitude of each vector
U_norm = U / N
V_norm = V / N

fig, ax = plt.subplots(figsize=(15, 8))
ax.quiver(X, Y, U_norm, V_norm, color='lime', alpha=0.4)  #(could have tried , normalize=True after color='lime' but 2d vector field doest not have normalization)

ax.set_title("Slope field for dx/dt = -t/x", color='white')
ax.set_xlabel("t")
ax.set_ylabel("x")
ax.grid(True, color='gray', alpha=0.3)

plt.show()

#integral curves
theta = np.linspace(0, np.pi, 200)
x_circle = 4 * np.cos(theta)
y_circle = 4 * np.sin(theta)

ax.plot(x_circle, y_circle, color=(1, 0, 0, 1), linewidth=3)


# 8 points on the semicircle (phase space)
n_points = 11
theta_pts = np.linspace(0, np.pi, n_points)
x_pts = 4 * np.cos(theta_pts)
y_pts = 4 * np.sin(theta_pts)


#ax.scatter for plotting points
#s controls size of the dots
#zorder controls the order of stacking. we want the yellow dots to be on top of everyone else

# plot the points on the semicircle
ax.scatter(
    x_pts, y_pts, 
    color='yellow',
    #edgecolor='black',
    #marker='o'          # shape: o for circle. s for square, ^ for triangle, x,*,...
    s=100, 
    zorder=5, 
    label='Sample points')

# projections onto vertical-axis (configuration space)
ax.scatter(np.zeros_like(x_pts), y_pts, color='cyan', s=100, zorder=5, label='Projections (config space)')

# dashed horizontal lines connecting each point to its projection
for xi, yi in zip(x_pts, y_pts):
    ax.plot([xi, 0], [yi, yi], color='cyan', linestyle='--', linewidth=2, alpha=1)

ax.legend(facecolor='black', edgecolor='white', labelcolor='white')
plt.show()




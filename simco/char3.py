import numpy as np
import matplotlib.pyplot as plt

plt.style.use('dark_background')

fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

# Direction of each characteristic line (constant velocity in x1, x2 per unit t)
a1 = 0.1
a2 = 0.2

t = np.linspace(0, 3, 100)   # parametrize by t, your domain t>=0

# Family of starting points (x1^0, x2^0) at t=0
starting_points = [(-1, -1), (-0.5, -1), (0, -1), (0.5, -1), (1, -1),
                   (-1, -0.5), (-0.5, -0.5), (0, -0.5), (0.5, -0.5), (1, -0.5),
                   (-1, 0), (-0.5, 0), (0, 0), (0.5, 0), (1, 0),
                   (-1, 0.5), (-0.5, 0.5), (0, 0.5), (0.5, 0.5), (1, 0.5)]

#this controls the walls xy-yz-zx
ax.xaxis.set_pane_color((0, 0, 0, 0))
ax.yaxis.set_pane_color((0, 0, 0, 0))
ax.zaxis.set_pane_color((0.5, 0.5, 0.5, 0.2))

# Fainted gridlines
ax.xaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.1)
ax.yaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.1)
ax.zaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.1)


for x1_0, x2_0 in starting_points:
    x1_line = x1_0 + a1 * t
    x2_line = x2_0 + a2 * t
    ax.plot(x1_line, x2_line, t, color='lime', alpha=1)

ax.set_xlabel("x_1")
ax.set_ylabel("x_2")
ax.set_zlabel("t")



ax.scatter(0.5, -0.5, 0.8, color='white', s=100, label='(x_1,x_2,t)')

# Single 3D arrow 
ax.quiver(0.5, -0.5, 0.8, a1, a2, 1, color='red', linewidth=2, arrow_length_ratio=0.15)

ax.quiver(-1, -1, 0, a1, a2, 0, color='yellow', linewidth=2, arrow_length_ratio=0.15, label='$b$')
ax.quiver(-1+a1, -1+a2, 0, 0, 0, 1, color='cyan', linewidth=2, arrow_length_ratio=0.15)
ax.quiver(-1, -1, 0, a1, a2, 1, color='red', linewidth=2, arrow_length_ratio=0.15, label='$(b,1)$')


ax.legend()
plt.show()
import numpy as np
import matplotlib.pyplot as plt

plt.style.use('dark_background')

#we will create 3 mesh:the one for surface & tangent space will have much more points but for vectors not so much.





#Surface
x = np.linspace(-1, 1, 40)
y = np.linspace(-1, 1, 40)
X, Y = np.meshgrid(x, y)
Z = np.exp(-(X**2 + Y**2))


#the tangent space plot
x1 = np.linspace(-0.7, 0.7, 40)
y1 = np.linspace(-0.7, 0.7, 40)
X1, Y1 = np.meshgrid(x1, y1)
Z1 = np.full_like(X1, 1)

#Plot
fig = plt.figure(figsize=(8, 8))               #creates a single window for surface and tangent space
ax = fig.add_subplot(111, projection='3d')     #creates the space where we attach the fig helpful when 2/3/..figs


#this controls the walls xy-yz-zx
ax.xaxis.set_pane_color((0, 0, 0, 0))
ax.yaxis.set_pane_color((0, 0, 0, 0))
ax.zaxis.set_pane_color((0.5, 0.5, 0.5, 0.2))

# Fainted gridlines
ax.xaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.1)
ax.yaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.1)
ax.zaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.1)


ax.plot_surface(X, Y, Z, cmap='jet', alpha=0.75, zorder=5)              #plots the surface
ax.plot_surface(X1, Y1, Z1, cmap='jet', alpha=0.8, zorder=10)          #plots the tangent plane
#point at 001
ax.scatter(0, 0, 1.05, color='magenta', s=200, zorder=20, depthshade=False)              #we want it at 001 but then it will coincide with where the plane is and that will creat problem in rendering!






#the first vector field(underlying)
x_vec = np.linspace(-0.5, 0.5, 5)
y_vec = np.linspace(-0.5, 0.5, 5) 
z_vec = np.linspace(1, 1.5, 2) 
X_vec, Y_vec, Z_vec = np.meshgrid(x_vec, y_vec, z_vec)

U2 = np.full_like(Z_vec, 0.5)                    
V2 = np.full_like(Z_vec, 0)
W2 = np.full_like(Z_vec, 0)

ax.quiver(
     X_vec, Y_vec, Z_vec, U2, V2, W2,
     length=0.4, 
     color='lime',
     alpha=1,
     zorder=15,
     label='b(x)')


ax.set_xlabel("x_1")
ax.set_ylabel("x_2")
ax.set_zlabel("x_3")









#fixes the elevation and rotation; standard elev=30, azim=-60.
#ax.view_init(elev=90, azim=0)    # straight-down "top view" — like a 2D contour plot
#ax.view_init(elev=0, azim=0)     # dead-on side view — flattens depth, useful for checking one axis
ax.view_init(elev=22.7, azim=-60)  #I likey. 
plt.show()
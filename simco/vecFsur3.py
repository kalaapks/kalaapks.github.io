import numpy as np
import matplotlib.pyplot as plt

plt.style.use('dark_background')

#we will create two mesh, the one for surface will have much more points but for vectors not so much.
#Surface
x = np.linspace(-1, 1, 40)
y = np.linspace(-1, 1, 40)
X, Y = np.meshgrid(x, y)
Z = np.exp(-(X**2 + Y**2))

#Plot
fig = plt.figure(figsize=(8, 8))              #creates the window
ax = fig.add_subplot(111, projection='3d')     #creates the space where we attach the fig helpful when 2/3/..figs

#this controls the walls xy-yz-zx
ax.xaxis.set_pane_color((0, 0, 0, 0))
ax.yaxis.set_pane_color((0, 0, 0, 0))
ax.zaxis.set_pane_color((0.5, 0.5, 0.5, 0.2))

# Fainted gridlines
ax.xaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.1)
ax.yaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.1)
ax.zaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.1)


ax.plot_surface(X, Y, Z, cmap='jet', alpha=0.6, zorder=5)   #plots the surface





#the first vector field(underlying)
x_vec = np.linspace(-0.5, 0.5, 4)
y_vec = np.linspace(-0.5, 0.5, 4) 
z_vec = np.linspace(-0.5, 1, 3) 
X_vec, Y_vec, Z_vec = np.meshgrid(x_vec, y_vec, z_vec)

U2 = X_vec
V2 = Y_vec
W2 = np.full_like(Z_vec, 0.5)

ax.quiver(
     X_vec, Y_vec, Z_vec, U2, V2, W2,
     normalize=True,
     length=0.35, 
     color='lime',
     alpha=1)





#the second vector field on the surface.
#no Z as we usually do even though the vector field is in 3d because the 3rd component is defined using the first two, this is what make sit the vector field ON the surface.

x2 = np.linspace(-1, 1, 16)
y2 = np.linspace(-1, 1, 16)  
X2, Y2 = np.meshgrid(x2, y2)
Z2 = np.exp(-(X2**2 + Y2**2))                                      # the surface f(x,y)

#Partial derivatives (analytic, since we know f explicitly)
fx = -2*X2 * np.exp(-(X2**2 + Y2**2))                              #df/dx
fy = -2*Y2 * np.exp(-(X2**2 + Y2**2))                              #df/dy

#Normal vector components
U = -fx
V = -fy
W = np.ones_like(Z2)

# Normalize so all normal arrows are the same length
#N = np.sqrt(U**2 + V**2 + W**2)
#U, V, W = U/N, V/N, W/N

ax.quiver(
     X2, Y2, Z2, U, V, W,
     length=0.2,
     color='red',
     alpha=0.5,
     zorder=10,
     label='Normal vectors')  #plots the vector field ON the surface since it is attaching the UVW vector at XYZ

#ax.set_title("Normal vectors to the surface", color='white')
ax.set_xlabel("x_1")
ax.set_ylabel("x_2")
ax.set_zlabel("x_3")







#fixes the elevation and rotation; standard elev=30, azim=-60.
#ax.view_init(elev=90, azim=0)    # straight-down "top view" — like a 2D contour plot
#ax.view_init(elev=0, azim=0)     # dead-on side view — flattens depth, useful for checking one axis
ax.view_init(elev=22.7, azim=-60)  #I likey. 
plt.show()
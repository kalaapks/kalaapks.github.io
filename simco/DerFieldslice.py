import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint

plt.style.use('dark_background')

omega = 2
zeta = 0.15

t = np.linspace(0, 8, 2)    #from 0 to 4 we will have two slices hence at 0 and at 4 but trajectory will run from 0 to 10 giving us our desired result
x1 = np.linspace(-3, 3, 6)
x2 = np.linspace(-3, 3, 6)
T, X1, X2 = np.meshgrid(t, x1, x2)

U = np.ones_like(T)                                # dt/dt = 1
V = X2                                             # dx1/dt = x2
W = -2*zeta*omega*X2 - omega**2 * X1               # dx2/dt = -2ζω x2 - ω²x1

fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

ax.xaxis.set_pane_color((0.5, 0.5, 0.5, 0.2))
ax.yaxis.set_pane_color((0, 0, 0, 0))
ax.zaxis.set_pane_color((0, 0, 0, 0))

ax.xaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.2)
ax.yaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.2)
ax.zaxis._axinfo["grid"]['color'] = (1, 1, 1, 0.3)
ax.quiver(
    T, X1, X2, U, V, W, 
    normalize=True,
    length=1.2,        #once normalized we may want to scale the vectors. 
    color='lime', 
    alpha=0.5)





#the vector field is only showing at t=0 and t=8 now. i want to add x1-x2 planes here to make this better. We will create a x1-x2 mess in existing range, we can since onlt time is truncated.

t_slice = 8
X1_plane, X2_plane = np.meshgrid(x1, x2)     #mesh of x1-x2
T_plane = np.full_like(X1_plane, t_slice)    #similar to np.ones_like(x)...here 

ax.plot_surface(T_plane, X1_plane, X2_plane, color=(0.5, 0.5, 0.5, 0.5))











#Solution trajectory

t = np.linspace(0, 10, 5)
x1 = np.linspace(-3, 3, 6)
x2 = np.linspace(-3, 3, 6)
T, X1, X2 = np.meshgrid(t, x1, x2)

def system(state, t):
    x1, x2 = state
    dx1_dt = x2
    dx2_dt = -2*zeta*omega*x2 - omega**2 * x1
    return [dx1_dt, dx2_dt]

t_curve = np.linspace(0, 10, 300)
initial_state = [3, 0]                                # x1(0)=3, x2(0)=0

solution = odeint(system, initial_state, t_curve)     #odeint is applying the system itertively to the initial condition at points in t_curve.
x1_curve = solution[:, 0]
x2_curve = solution[:, 1]

ax.plot(t_curve, x1_curve, x2_curve, color='red', linewidth=2)    #plots the points of t_curve in a col, thenpoints of x1, then x2 ~ like a 300x3 matrix

ax.set_title(r"Phase space: $x'' + 2\zeta\omega x' + \omega^2 x = 0$", color='white')
ax.set_xlabel("t")
ax.set_ylabel("x_1")
ax.set_zlabel("x_2")







# Find the index closest to t_slice in your solution's time array
idx = np.argmin(np.abs(t_curve - t_slice))                                     #simply taking the absolute value
ax.scatter(t_curve[idx], x1_curve[idx], x2_curve[idx], color='yellow', s=70)





plt.show()









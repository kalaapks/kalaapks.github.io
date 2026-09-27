import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint   #we are adding this but not going to use f_odeint since for solution curve plots we are directly going to use the explicit form of the exponential solution that is known to us.

plt.style.use('dark_background')

#shared partitioning
x = np.linspace(-4, 4, 16)
y = np.linspace(-2, 2, 16)
X, Y = np.meshgrid(x, y)

x_curve = np.linspace(-4, 4, 200)   # shared x-range for all solution curves

def add_solution_curves(ax, lam):
    for C in [1, 2, 3, 4, -1, -2, -3, -4]:
        y_curve = C * np.exp(lam * x_curve)
        ax.plot(x_curve, y_curve, linewidth=1.0)
    ax.set_ylim(-2, 2)   # keep the view consistent with your slope field's y-range
    ax.set_xlim(-4, 4)
#we will call this once every subplot after the solpe field coding is over.

#this is agan for solution curves, above def will give curves too close to one another



# Create the figure (the whole window)
fig = plt.figure(figsize=(14, 8)) 

#topleft
ax1 = fig.add_subplot(221)
lam1 = 8
U = np.ones_like(X)
V = lam1*Y       
N = np.sqrt(U**2 + V**2)
U_norm = U / N
V_norm = V / N
ax1.set_title("$\lambda$ >> 0")
ax1.quiver(X, Y, U_norm, V_norm, color='lime')
#call solution curves
add_solution_curves(ax1, lam1)


#topright
ax2 = fig.add_subplot(222)
lam2 = 0.8
U = np.ones_like(X)
V = lam2*Y            
N = np.sqrt(U**2 + V**2)
U_norm = U / N
V_norm = V / N
ax2.set_title("$\lambda$: positive but close to 0")
ax2.quiver(X, Y, U_norm, V_norm, color='lime')
add_solution_curves(ax2, lam2)


#bottomleft
ax3 = fig.add_subplot(223)
lam3 = -8
U = np.ones_like(X)
V = lam3*Y            
N = np.sqrt(U**2 + V**2)
U_norm = U / N
V_norm = V / N
ax3.set_title("$\lambda$ << 0")
ax3.quiver(X, Y, U_norm, V_norm, color='lime')
add_solution_curves(ax3, lam3)



#bottomright
ax4 = fig.add_subplot(224)
lam4 = -0.8
U = np.ones_like(X)
V = lam4*Y            
N = np.sqrt(U**2 + V**2)
U_norm = U / N
V_norm = V / N
ax4.set_title("$\lambda$: negative but close to 0")
ax4.quiver(X, Y, U_norm, V_norm, color='lime')
add_solution_curves(ax4, lam4)










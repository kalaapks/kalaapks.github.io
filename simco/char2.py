import numpy as np
import matplotlib.pyplot as plt

plt.style.use('dark_background')

# Shared x range
x = np.linspace(-1.5, 1.5, 500)
c_values = [-3, -2.75, -2.5, -2.25, -2, -1.75, -1.5, -1.25, -1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75]    #for intercepts
b1=0.75
b2=-0.4

# Create the figure (the whole window)
fig = plt.figure(figsize=(18, 6))   

#Left: neg b
ax1 = fig.add_subplot(121)          # 1 rows, 2 cols, position 1 (left)
ax1.set_xticks([-1, 0, 1])          # only show these specific tick marks
ax1.set_ylim(0, 3)                  # instead of (-1.5, 1.5) — only show t >= 0 will show as needed for the domain
for c in c_values:
    y1 = (x/b2) + c
    ax1.plot(x, y1, color='lime',alpha=0.5)

# Slope triangle at origin
ax1.annotate('', xy=(b2, 0), xytext=(0, 0),
             arrowprops=dict(arrowstyle='->', color='yellow', lw=2))
ax1.annotate('', xy=(b2, 1), xytext=(b2, 0),                                                  #xy=() gives where the arrow points and xytext=() gives where the arrow starts
             arrowprops=dict(arrowstyle='->',                                                 #'->' gives a simple arrowhead(otheroptions: '-|>' a filled triangle head, 'fancy', 'simple')
                             color='cyan', lw=2))                                             #lw is line width
ax1.annotate('', xy=(b2, 1), xytext=(0, 0),
             arrowprops=dict(arrowstyle='-|>', color='red', lw=2))
ax1.annotate('', xy=(-0.3+b2, 2.5), xytext=(-0.3, 1.5),
             arrowprops=dict(arrowstyle='-|>', color='red', lw=2))
ax1.annotate('', xy=(0, 1.75), xytext=(-b2, 0.75),
             arrowprops=dict(arrowstyle='-|>', color='red', lw=2))
ax1.text(b2/2, -0.2, 'run = b', color='yellow', ha='center')                                  #ha-horizontal allignment text placed at x y coordinate b2/2 -0.15 
ax1.text(b2 + 0.05, 0.5, 'rise = 1', color='cyan', va='center')                               #va-vertical allignment text placed at x y coordinate b1+ 0.05, 0.5

ax1.set_title("$b=-4/10$")
ax1.set_xlabel("x_1")
ax1.set_ylabel("t")
ax1.scatter(-0.3, 1.5, color='yellow', s=100, zorder=15, label='(x_1,t)')
ax1.scatter(-b2, 0.75, color='yellow', s=100, zorder=15)
ax1.grid(True, alpha=0.2)
ax1.legend()                                                                                   #lables appears in plot






#right: pos b
ax2 = fig.add_subplot(122)          # position 2
ax2.set_xticks([-1, 0, 1])          # only show these specific tick marks
ax2.set_ylim(0, 3)
for c in c_values:
    y2 = (x/b1) + c
    ax2.plot(x, y2, color='lime',alpha=0.5)

# Slope triangle at origin
ax2.annotate('', xy=(b1, 0), xytext=(0, 0),
             arrowprops=dict(arrowstyle='->', color='yellow', lw=2))
ax2.annotate('', xy=(b1, 1), xytext=(b1, 0),
             arrowprops=dict(arrowstyle='->', color='cyan', lw=2))
ax2.annotate('', xy=(b1, 1), xytext=(0, 0),
             arrowprops=dict(arrowstyle='-|>', color='red', lw=2))
ax2.annotate('', xy=(-0.22, 2.45), xytext=(-b1-0.22, 1.45),
             arrowprops=dict(arrowstyle='-|>', color='red', lw=2))
ax2.annotate('', xy=(b1, 2.5), xytext=(0, 1.5),
             arrowprops=dict(arrowstyle='-|>', color='red', lw=2))
ax2.text(b1/2, -0.2, 'run = b', color='yellow', ha='center', fontsize=10)
ax2.text(b1 + 0.05, 0.5, 'rise = 1', color='cyan', va='center') 

ax2.set_title("$b=3/4$")
ax2.set_xlabel("x_1")
ax2.set_ylabel("t")
ax2.scatter(-b1-0.22, 1.45, color='yellow', s=100, zorder=15, label='(x_1,t)')
ax2.scatter(0, 1.5, color='yellow', s=100, zorder=15)
ax2.grid(True, alpha=0.2)
ax2.legend()


#plt.tight_layout()

# Adjust spacing between subplots manually. if u use this, REMOVE plt.tight_layout()
plt.subplots_adjust(wspace=0.4)

plt.show()

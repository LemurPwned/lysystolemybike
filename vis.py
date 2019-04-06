import matplotlib.pyplot as plt
import requests
import json

r = requests.get("http://localhost:5000/trigger_calc").json()

x = []
y = []
sev = []
for node in r['nodes']:
    x.append(node['position'][0])
    y.append(node['position'][1])
    sev.append(node['severity'])

plt.style.use("seaborn")
plt.scatter(x, y, s=25, c=sev, cmap=plt.get_cmap('Reds'), label="Node")

x = []
y = []
for h in r['hubs']:
    x.append(h['position'][0])
    y.append(h['position'][1])

plt.scatter(x, y, s=100, label="Hub")

plt.legend()
plt.show()

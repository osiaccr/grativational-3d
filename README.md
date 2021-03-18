# Interactions between bodies in Newtonian space

A simple representation of interactions between bodies with a mass in Newtonian space.

To run: opening the index.html file will probably cause a CORS error from your browser. Simplest way to run it is then to start a http server with `python3 -m http.server` in the root folder of the project, then go to http://localhost:8000/

Done with three.js, some math and physics. For this "model" I have translated SI units into proprietery units.

- 1 um (unit mass) is equal to the mass of the Earth

![equation](http://www.sciweavers.org/tex2img.php?eq=1um%20%3D%206%20%2A%2010%5E%7B24%7D%20%20kg&bc=White&fc=Black&im=jpg&fs=12&ff=arev&edit=0)

- 1 ud (unit distance) is equal to the distance from Eath to the Sun

![equation](http://www.sciweavers.org/tex2img.php?eq=1ud%3D1.5%2A10%5E8&bc=White&fc=Black&im=jpg&fs=12&ff=arev&edit=0)

Pluggin these into G, we get:

![equation](http://www.sciweavers.org/tex2img.php?eq=%0A%0A1%20kg%20%3D%206%20%2A%2010%5E%7B-24%7D%20um%0A%0A1%20m%20%3D%2015%20%2A%2010%5E%7B-7%7D%20ud%0A%0A1%20m%5E3%20%3D%203375%20%2A%2010%5E%7B-21%7D%20ud%5E3%20%3D%203.375%20%2A%2010%5E%7B-18%7D%20ud%5E3%0A%0AG%20%3D%206.674%20%2A%2010%5E%7B-11%7D%20%2A%201%2F6%20%2A%2010%5E24%20%2A%203.375%20%2A%2010%5E%7B-18%7D%20ud%5E3%20%0Aum%5E%7B-1%7D%20s%5E%7B-2%7D%0A%0AG%20%3D%203%2C7391085%20%2A%2010%5E%7B-5%7D%20ud%5E3%20um%5E%7B-1%7D%20s%5E%7B-2%7D&bc=White&fc=Black&im=jpg&fs=12&ff=arev&edit=0)

Which is a good enough estimation for our needs.

This simulation usses a time step 10 seconds. This isn't the ratio of real to simulated time, but the finite detail of the system. In a perfect system this would be close to 0.

The inner workings are quite simple: on every update calculate the force vector of each body in relation the each other body, add these up to get a total force vector, get the acceletariont from that and update the speed and position.

The 2 big equations that are needed here are:

- Newton's law of universal gravitation

![equation](http://www.sciweavers.org/tex2img.php?eq=F%3DG%7B%5Cfrac%20%7Bm_%7B1%7Dm_%7B2%7D%7D%7Br%5E%7B2%7D%7D%7D&bc=White&fc=Black&im=jpg&fs=12&ff=arev&edit=0)

- Newton's Second Law of Motion

![equation](http://www.sciweavers.org/tex2img.php?eq=F%3Dm%2Aa&bc=White&fc=Black&im=jpg&fs=12&ff=arev&edit=0)

!!!Big man Newton!!!

There are some controlls in place:

- s to start/stop simulation
- m to hide/display axes helper
- +/- to increase/decrease timestep

Here are some screenshots. If you want to recreate them, the settings are saved in presets.js. Have fun!

#2
![](./imgs/img2.png)

#3
![](./imgs/img3.png)

#4
![](./imgs/img4.png)

!! Known problem: When two bodies collide (or should collide, since the model dosen't simulate collisions) they end up shooting in diferent directions due to the r from the Universal Attraction Law equation being close to 0, resulting in a giganting force.

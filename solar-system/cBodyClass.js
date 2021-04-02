

class cBody {
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} Vx 
     * @param {Number} Vy
     * @param {Number} mass 
     * @param {Number} scale 
     * @param {Array} paths
     */
    constructor(x, y, Vx, Vy, mass, scale, paths) {

        this.x = x;
        this.y = y;
        this.Vx = Vx;
        this.Vy = Vy;
        this.mass = mass;
        this.scale = scale;
        this.radius = 5;
        this.path = paths;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        context.beginPath();
        context.fillStyle = "Black";
        context.arc(this.x * this.scale, this.y * this.scale, this.radius, 0, 2 * Math.PI);
        context.fill();
    }

    /** 
     * 
     * @param {Number} deltaTime
    */
    move(deltaTime) {
        if(this.x*this.scale >= 0 && this.x*this.scale < 500 && this.y*this.scale >= 0 && this.y*this.scale < 500) {
            this.path[Number.parseInt(this.x*this.scale)][Number.parseInt(this.y*this.scale)] = true;
        }
		//console.log(this.x + " " + this.y);
    }


    /**
     * 
     * @param {Number} deltaTime 
     * @param {cBody} otherBody 
     * @param {Number} G
     */
    calculateVelocity(deltaTime, otherBody, G) {
        //runge-kutta 4th order 2nd or 1st (nie wiem sam) derivative

        /**
         * 
         * @param {Number} G 
         * @param {Number} x1 
         * @param {Number} y1 
         * @param {Number} x2 
         * @param {Number} y2 
         * @param {Number} m1 
         * @param {Number} m2 
         * @returns Array[Ax, Ay]
         */
        var calcAcc = (G, x1, y1, x2, y2, m1, m2) => {
            var deltaX = x2 - x1;
            var deltaY = y2 - y1;
            var rSqr = deltaX ** 2 + deltaY ** 2;
            var r = Math.sqrt(rSqr);

            var F = G * m1 * m2 / rSqr;
            var Fx = F * (deltaX / r);
            var Fy = F * (deltaY / r);
            var Ax = Fx / m1;
            var Ay = Fy / m1;

            return /** @type {Array[Number, Number]} */[Ax, Ay];
        };

        var c0 = [this.Vx, this.Vy];
        var k0 = calcAcc(G, this.x, this.y, otherBody.x, otherBody.y, this.mass, otherBody.mass);

        var co0 = [otherBody.Vx, otherBody.Vy];
        var ko0 = calcAcc(G, otherBody.x, otherBody.y, this.x, this.y, otherBody.mass, this.mass);

        var c1 = [c0[0] + (deltaTime / 2) * k0[0], c0[1] + (deltaTime / 2) * k0[1]];
        var k1 = calcAcc(
            G,
            this.x + (deltaTime / 2) * c0[0],
            this.y + (deltaTime / 2) * c0[1],
            otherBody.x + (deltaTime / 2) * co0[0],
            otherBody.y + (deltaTime / 2) * co0[1],
            this.mass,
            otherBody.mass
        );

        var co1 = [co0[0] + (deltaTime / 2) * ko0[0], co0[1] + (deltaTime / 2) * ko0[1]];
        var ko1 = calcAcc(
            G,
            otherBody.x + (deltaTime / 2) * co0[0],
            otherBody.y + (deltaTime / 2) * co0[1],
            this.x + (deltaTime / 2) * c0[0],
            this.y + (deltaTime / 2) * c0[1],
            otherBody.mass,
            this.mass
        );

        var c2 = [c0[0] + (deltaTime / 2) * k1[0], c0[1] + (deltaTime / 2) * k1[1]];
        var k2 = calcAcc(
            G,
            this.x + (deltaTime / 2) * c1[0],
            this.y + (deltaTime / 2) * c1[1],
            otherBody.x + (deltaTime / 2) * co1[0],
            otherBody.y + (deltaTime / 2) * co1[1],
            this.mass,
            otherBody.mass
        );

        var co2 = [co0[0] + (deltaTime / 2) * ko1[0], co0[1] + (deltaTime / 2) * ko1[1]];
        var ko2 = calcAcc(
            G,
            otherBody.x + (deltaTime / 2) * co1[0],
            otherBody.y + (deltaTime / 2) * co1[1],
            this.x + (deltaTime / 2) * c1[0],
            this.y + (deltaTime / 2) * c1[1],
            otherBody.mass,
            this.mass
        );

        var c3 = [c0[0] + deltaTime * k2[0], c0[1] + deltaTime * k2[1]];
        var k3 = calcAcc(
            G,
            this.x + deltaTime * c2[0],
            this.y + deltaTime * c2[1],
            otherBody.x + deltaTime * co2[0],
            otherBody.y + deltaTime * co2[1],
            this.mass,
            otherBody.mass
        );

        var co3 = [co0[0] + deltaTime * ko2[0], co0[1] + deltaTime * ko2[1]];
        var ko3 = calcAcc(
            G,
            otherBody.x + deltaTime * co2[0],
            otherBody.y + deltaTime * co2[1],
            this.x + deltaTime * c2[0],
            this.y + deltaTime * c2[1],
            otherBody.mass,
            this.mass
        );

        var deltaVx = (deltaTime / 6) * (k0[0] + 2 * k1[0] + 2 * k2[0] + k3[0]);
        var deltaVy = (deltaTime / 6) * (k0[1] + 2 * k1[1] + 2 * k2[1] + k3[1]);
        var deltaOVx = (deltaTime / 6) * (ko0[0] + 2 * ko1[0] + 2 * ko2[0] + ko3[0]);
        var deltaOVy = (deltaTime / 6) * (ko0[1] + 2 * ko1[1] + 2 * ko2[1] + ko3[1]);

        this.Vx += deltaVx;
        this.Vy += deltaVy;
        otherBody.Vx += deltaOVx;
        otherBody.Vy += deltaOVy;

        var deltaX = (deltaTime / 6) * (c0[0] + 2 * c1[0] + 2 * c2[0] + c3[0]);
        var deltaY = (deltaTime / 6) * (c0[1] + 2 * c1[1] + 2 * c2[1] + c3[1]);
        var deltaOX = (deltaTime / 6) * (co0[0] + 2 * co1[0] + 2 * co2[0] + co3[0]);
        var deltaOY = (deltaTime / 6) * (co0[1] + 2 * co1[1] + 2 * co2[1] + co3[1]);

        this.x += deltaX;
        this.y += deltaY;
        otherBody.x += deltaOX;
        otherBody.y += deltaOY;


    }


}
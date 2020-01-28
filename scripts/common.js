// TODO: custom weapon alternation code

function createMultiWeapon(parent){
	parent.weapon = new JavaAdapter(Weapon, {
		constructor: function(name, parent, isMech){
			this.parent = parent;
			this.name = name;
			this.isMech = parent.turnCursor !== undefined; // Will not work if UnitType gains a turnCursor field
		},

		// @Override
		load: function(){
			this.region = Core.atlas.find("empty");
		},

		// @Override
		update: function(shooter, pX, pY){
			var pos = Vec2(pX, pY);
			pos.sub(shooter.getX(), shooter.getY());
			if(pos.len() < this.minPlayerDist){ // TODO: see if this affects units
				pos.setLength(this.minPlayerDist);
			}
			var cx = pos.x + shooter.getX(), cy = pos.y + shooter.getY();

			var ang = pos.angle();
			pos.setAngle(ang);
			pos.trns(ang - 90, this.getWidth(), this.getLength());

			// "realUpdate" to avoid bs infinite recursion
			this.realUpdate(shooter, pos.x, pos.y, Angles.angle(shooter.getX() + pos.x, shooter.getY() + pos.y, cx, cy), false);
		},

		realUpdate: function(shooter, x, y, angle, number){
			if(shooter.getTimer().get(shooter.getShootTimer(false), this.reload)){
				this.shoot(shooter, x, y, angle, false);
			}
		},

		// @Override
		shoot: function(shooter, x, y, angle, ign){
			if(this.parent != null){
				const lastRotation = this.parent.trueRotation(shooter);

				// TODO: see how player does it and fix wrapping
				// Prevent wrapping around at +X
				if(Math.abs(angle - lastRotation) > 180){
					angle += 360;
				}

				// TODO: lerp towards target instead of this?
				// Limit rotation speed
				const rotationLimit = this.parent.rotationLimit;
				if(Math.abs(angle - lastRotation) > rotationLimit){
					// Decide which direction to turn
					if((angle - lastRotation) > lastRotation){
						angle = rotationLimit;
				 	}else{
						angle = -rotationLimit;
					}
					angle += lastRotation;
				}
				this.parent.trueRotation(shooter, angle);

				if(Vars.net.client()){
					this.shootDirect(shooter, x, y, angle, false);
				}else if(this.isMech){
					Call.onPlayerShootWeapon(shooter, x, y, angle, false);
				}else{
					Call.onGenericShootWeapon(shooter, x, y, angle, false);
				}

				this.parent.onShoot(this);
			}
		}
	}, parent.name + "-multi-weapon");
}

/*
Mech and units pull from this code
Do not extend in your mods.
*/
const Common = {
	// @Override
	constructor: function(name){
		this.name = name;
		this.entities = [];
	},

	// @Override
	load: function(){ // YAY I can use load() because it doesn't need super!
		this.weapon.load();
		this.region = Core.atlas.find("clear");
		this.loadAfter();
	},

	loadAfter: function(){},

	drawWeapons: function(parent, rot){
		const lim = Mathf.floor(this.weapons.length / 2);
		var index = 0;
		for(var num = -lim; num < lim; num++){
			if(num != 0 || this.weapons.length % 2 == 1){
				this.drawWeapon(player, rot, num, index++);
			}
		}
	},

	drawWeapon: function(parent, rot, num, index){
		const weapon = this.weapons[index];
		// TODO: Use same maths from mother hen to actually move it properly instead of this joke
		Draw.rect(weapon.region, parent.x + weapon.width * num, parent.y + weapon.length, rot); // Evenly space out each weapon by default
	},

	drawAbove: function(parent, rotation){},
	drawUnder: function(player, rotation){},

	trueRotation: function(parent, rotation){
		var ent = this.entity(parent);
		ent.trueRotation = rotation;
		this.entity(parent, ent);
		return rotation;
	},
	trueRotation: function(parent){
		return this.entity(parent).trueRotation;
	},

	entity: function(parent, ent) {
		print("Set ent " + parent + " to " + ent);
		return this.entities[parent] = ent;
	},
	entity: function(player) {
		print("Get ent " + parent);
		var ent = this.entities[parent];
		if(ent === undefined){
			ent = this.entity(parent, {
				trueRotation: null
			});
		}
		return ent;
	}
};
Common.entities = {};
Common.rotationLimit = 0;
Common.rotationLerp = 0.01;
Common.weapons = [];
createMultiWeapon(Common);

entityLib.Common = Common;
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

/* Mech and units pull from this code */
const common = {
	// @Override
	constructor: function(name){
		this.name = name;
		this.weapon = createMultiWeapon(this);
	},

	// @Override
	load: function(){ // YAY I can use load() because it doesn't need super!
		this.weapon.load();
		this.region = Core.atlas.find("clear");
		this.loadAfter();
	},

	// @Override
	updateAlt: function(player){
		// Rotation stuff
		const rot = this.trueRotation(player);
		if(rot === null){
			rot = player.rotation;
		}
		this.trueRotation(player, Mathf.lerp(rot, player.rotation, this.rotationLerp);
		this.update(player);
	},

	// @Override
	draw: function(player){
		const rotation = this.trueRotation(player) - 90;
		this.drawGuns(player);
		Draw.rect(this.bodyRegion, player.x, player.y, rotation);

		const tmp = player.rotation;
		player.rotation = rotation + 90;
		player.drawLight();
		player.drawBackItems();
		player.rotation = tmp;
		this.drawOver(player);
	},

	drawWeapons: function(player, rot){
		const lim = Mathf.floor(this.weapons.length / 2);
		for(var i = -lim; i < lim; i++){
			if(i != 0 || this.weapons.length % 2 == 1){
				this.drawWeapon(player, rot, i);
			}
		}
	},

	drawWeapon: function(player, rot, num){
		
	}

	// @Override
	drawStats: function(player){
		const health = player.healthf();
		Draw.color(Color.black, player.getTeam().color, health + Mathf.absin(Time.time(), health * 5, 1 - health));
		Draw.rect(player.getPowerCellRegion(),
			player.x + Angles.trnsx(this.targetRotation, this.cellTrnsY, 0),
			player.y + Angles.trnsy(this.targetRotation, this.cellTrnsY, 0),
			this.trueRotation(player - 90);
		Draw.reset();
	},

	trueRotation: function(player, rotation){
		this.entities[player].trueRotation = rotation;
	},

	trueRotation: function(player){
		this.entities[player].trueRotation;
	}
});

print("DEBUG - loaded first one");
entityLib = {};

function createMultiWeapon(entity){
	entity.weapon = new JavaAdapter(Weapon, {
		// Don't ask
		// @Override
		constructor: function(name, parent){
			this.parent = parent;
			this.name = name;
		},
		load: function(){
			print("No!!!!!!");
		},
		loadProperly: function(parent){
			this.region = Core.atlas.find("clear");
			if(mech != null){
				this.parent = parent;
			}
		},

		// Do turning slowly like a tank
		// @Override
		update: function(shooter, pX, pY){
			var left = false;
			do{
				var pos = Vec2(pX, pY);
				pos.sub(shooter.getX(), shooter.getY());
				if(pos.len() < this.minPlayerDist){
					pos.setLength(this.minPlayerDist);
				}
				var cx = pos.x + shooter.getX(), cy = pos.y + shooter.getY();

				var ang = pos.angle();
				pos.setAngle(ang);
				pos.trns(ang - 90, this.width * Mathf.sign(left), this.length + Mathf.range(this.lengthRand));

				// "realUpdate" to avoid bs infinite recursion
				this.realUpdate(shooter, pos.x, pos.y, Angles.angle(shooter.getX() + pos.x, shooter.getY() + pos.y, cx, cy), left);
				left = !left;
			}while(left);
		},

		realUpdate: function(shooter, x, y, angle, left){
			if(shooter.getTimer().get(shooter.getShootTimer(left), this.reload)){
				if(this.alternate){
					shooter.getTimer().reset(shooter.getShootTimer(!left), this.reload / 2);
				}

				this.shoot(shooter, x, y, angle, left);
			}
		},

		// @Override
		shoot: function(shooter, x, y, angle, left){
			if(this.parent != null){
				const lastRotation = this.parent.getRotation();

				// Prevent wrapping around at +X
				if(Math.abs(angle - lastRotation) > 180){
					angle += 360;
				}
				// Limit rotation speed
				if(Math.abs(angle - lastRotation) > rotateSpeed){
					// Decide which direction to turn
					if((angle - lastRotation) > lastRotation){
						angle = rotateSpeed;
					}else{
						angle = -rotateSpeed;
					}
					angle += lastRotation;
				}
				this.parent.setRotation(angle);

				if(Vars.net.client()){
					this.shootDirect(shooter, x, y, angle, left);
				}else{
					// TODO: fix
					// WILL NOT WORK FOR GENERIC STUFF!!!!
					// I'm hoping nobody will set a units weapon to this...
					Call.onPlayerShootWeapon(shooter, x, y, angle, left);
				}

				this.parent.rotateBarrel();
			}
		}
	}, entity.name + "-multi-weapon");
}

/* Complete rewrite of mech */
const hurricane = extendContent(Mech, "hurricane", {
	// @Override
	load: function(){ // YAY I can use load() because it doesn't need super!
		this.weapon.loadProperly(this);
		this.gun.load();

		this.region = Core.atlas.find("clear");
		this.rotorRegion = Core.atlas.find(this.name + "-rotor");
		this.gunBarrelRegion = Core.atlas.find(this.name + "-gun-barrel");
		this.bodyRegion = Core.atlas.find(this.name + "-body");
	},

	// @Override
	updateAlt: function(player){
		// Rotation stuff
		if(this.targetRotation === null){
			this.targetRotation = player.rotation;
		}
		this.targetRotation = Mathf.lerp(this.targetRotation, player.rotation, 0.03);
		this.rotorSpeed = Mathf.lerp(this.rotorSpeed, 15, 0.001);
	},

	// @Override
	draw: function(player){
		const rotation = this.targetRotation - 90;
		this.drawGuns(player);
		Draw.rect(this.bodyRegion, player.x, player.y, rotation);

		const tmp = player.rotation;
		player.rotation = this.targetRotation;
		player.drawLight();
		player.drawBackItems();
		player.rotation = tmp;

		Draw.rect(this.rotorRegion, player.x, player.y, rotation + Time.time() * this.rotorSpeed);
	},

	drawGuns: function(player){
		for(var side = -1; side < 2; side += 2){
			this.drawBarrel(player, side, 0);
			this.drawBarrel(player, side, 2);
			this.drawBarrel(player, side, 1);
		}
	},

	drawBarrel: function(player, side, num){
		const barrel = (this._barrelRotation + num / 3) % 1;
		const barrelX = Angles.trnsx(this.targetRotation, this.gunOffsetY - Math.abs(barrel - 0.5), side * (this.gunOffsetX + barrel));
		const barrelY = Angles.trnsy(this.targetRotation, this.gunOffsetY - Math.abs(barrel - 0.5), side * (this.gunOffsetX + barrel));
		Draw.rect(this.gunBarrelRegion, player.x + barrelX, player.y + barrelY, this.targetRotation - 90);
	},

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

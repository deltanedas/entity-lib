// TODO: custom weapon alternation code
// TODO: prevent rotation wrapping around at +X
const MultiWeapon = {
	// @Override
	load(){
		this.region = Core.atlas.find("empty");
		this.loadAfter();
	},
	loadAfter(){},

	// @Override
	update(shooter, pX, pY){
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

	getWidth(){
		return this.weapons[this.weapon].width;
	},
	getLength(){
		return this.weapons[this.weapon].length;
	},

	realUpdate(shooter, x, y, angle, number){
		if(shooter.getTimer().get(shooter.getShootTimer(false), this.reload)){
			this.shoot(shooter, x, y, angle, false);
		}
	},

	// @Override
	shoot(shooter, x, y, angle, ign){
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

			// Cycle through weapons
			if(Vars.net.client()){
				this.shootDirect(shooter, x, y, angle, false);
			}else if(this.isMech){
				Call.onPlayerShootWeapon(shooter, x, y, angle, false);
			}else{
				Call.onGenericShootWeapon(shooter, x, y, angle, false);
			}

			this.parent.onShoot(shooter, this);
			this.cycleWeapons();
		}
	},

	cycleWeapons(){
		this.weapon = (this.weapon++) % this.weapons.length;
	},

	// @Override
	shootDirect(shooter, offsetX, offsetY, rotation, ign){
		this.realShootDirect(shooter, offsetX, offsety, rotation, this.weapon);
	},

	// Basically copy pasted vanilla code but made it use current weapon
	realShootDirect(shooter, offsetX, offsety, rotation, num){
		const weapon = this.weapons[num];

		const x = shooter.getX() + offsetX;
		const y = shooter.getY() + offsetY;
		const baseX = shooter.getX(), baseY = shooter.getY();

		weapon.shootSound.at(x, y, Mathf.random(0.8, 1.0));

		this.sequenceNum = 0;
		if(weapon.shotDelay > 0.01){
			Angles.shotgun(weapon.shots, weapon.spacing, rotation, f => {
				Time.run(this.sequenceNum * weapon.shotDelay, () => weapon.bullet(shooter, x + shooter.getX() - baseX, y + shooter.getY() - baseY, f + Mathf.range(weapon.inaccuracy)));
				this.sequenceNum++;
			});
		}else{
			Angles.shotgun(weapon.shots, weapon.spacing, rotation, f => weapon.bullet(shooter, x, y, f + Mathf.range(weapon.inaccuracy)));
		}

		const ammo = weapon.bullet;

		Tmp.v1.trns(rotation + 180, ammo.recoil);

		shooter.velocity().add(Tmp.v1);

		Tmp.v1.trns(rotation, 3);

		Effects.shake(weapon.shake, weapon.shake, x, y);
		Effects.effect(weapon.ejectEffect, x, y, rotation * Mathf.clamp(num, -1, 1));
		Effects.effect(ammo.shootEffect, x + Tmp.v1.x, y + Tmp.v1.y, rotation, shooter);
		Effects.effect(ammo.smokeEffect, x + Tmp.v1.x, y + Tmp.v1.y, rotation, shooter);

		//reset timer for remote players
		shooter.getTimer().get(shooter.getShootTimer(false), weapon.reload);
	}
};

/*
Mech and units pull from this code
Do not extend in your mods.
*/
const state = this;
const Common = {
	init(){
		print("common init")
		this.weapon = state.global.entityLib.extendWeapon(Weapon, this, {});
		this.entities = [];
		this.initAfter();
	},
	initAfter(){},

	// @Override
	load(){ // YAY I can use load() because it doesn't need super!
		this.weapon.load();
		this.region = Core.atlas.find("clear");
		this.loadAfter();
	},
	loadAfter(){},

	drawWeapons(parent, rot){
		const lim = Mathf.floor(this.weapons.length / 2);
		var index = 0;
		for(var num = -lim; num < lim; num++){
			if(num != 0 || this.weapons.length % 2 == 1){
				this.drawWeapon(player, rot, num, index++);
			}
		}
	},

	drawWeapon(parent, rot, num, index){
		const weapon = this.weapons[index];
		// TODO: Use same maths from mother hen to actually move it properly instead of this joke
		Draw.rect(weapon.region, parent.x + weapon.width * num, parent.y + weapon.length, rot); // Evenly space out each weapon by default
	},

	drawAbove(parent, rotation){},
	drawUnder(parent, rotation){},

	onShoot(shooter, weapon){},

	setTrueRotation(parent, rotation){
		var ent = this.getEntity(parent);
		ent.trueRotation = rotation;
		this.setEntity(parent, ent);
		return rotation;
	},
	getTrueRotation(parent){
		return this.getEntity(parent).trueRotation;
	},

	setEntity(parent, ent) {
		return this.entities[parent] = ent;
	},
	getEntity(parent) {
		var ent = this.entities[parent];
		if(ent === undefined){
			ent = this.setEntity(parent, {
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

this.global.entityLib.Common = Common;
this.global.entityLib.MultiWeapon = MultiWeapon
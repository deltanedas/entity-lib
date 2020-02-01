// TODO: custom weapon alternation code
const MultiWeapon = {
	// @Override
	load(){
		this.region = Core.atlas.find("clear");
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
		return this.parent.weapons[this.weapon].width;
	},
	getLength(){
		return this.parent.weapons[this.weapon].length;
	},

	realUpdate(shooter, x, y, angle, number){
		if(shooter.getTimer().get(shooter.getShootTimer(false), this.reload)){
			this.shoot(shooter, x, y, angle, false);
		}
	},

	// @Override
	shoot(shooter, x, y, angle, ign){
		if(this.parent !== null){
			const lastRotation = this.parent.getTrueRotation(shooter);

			// TODO: see how player does it and fix wrapping
			// Prevent wrapping around at +X
			if(Math.abs(angle - lastRotation) > 180){
				angle += 360;
			}

			// TODO: lerp towards target instead of this?
			// Limit rotation speed
			const rotationLimit = this.parent.rotationLimit;
			if(rotationLimit > 0){
				if(Math.abs(angle - lastRotation) > rotationLimit){
					// Decide which direction to turn
					if((angle - lastRotation) > lastRotation){
						angle = rotationLimit;
					}else{
						angle = -rotationLimit;
					}
					angle += lastRotation;
				}
			}
			this.parent.setTrueRotation(shooter, angle);

			this.parent.weapon = this.parent.weapons[this.weapon];
			if(Vars.net.client()){
				this.shootDirect(shooter, x, y, angle, false);
			}else if(this.isMech){
				Call.onPlayerShootWeapon(shooter, x, y, angle, false);
			}else{
				Call.onGenericShootWeapon(shooter, x, y, angle, false);
			}
			this.parent.weapon = this;

			this.parent.onShoot(shooter, this.weapon);
			this.cycleWeapons();
			this.updateStats();
		}
	},

	cycleWeapons(){
		this.weapon = (this.weapon++) % this.parent.weapons.length;
	},

	updateStats(){
		const weapon = this.parent.weapons[this.weapon];
		this.reload = weapon.reload;
		this.shots = weapon.shots;
		this.width = weapon.width * -(Mathf.floor(this.parent.weapons.length / 2) - this.weapon);
		this.length = weapon.length;
	}
};

/*
Mech and units pull from this code
Do not extend in your mods.
*/
const state = this;
const Common = {
	// @Override
	init(){
		this.weapon = state.global.entityLib.extendWeapon(Weapon, this, {});
		this.weapon.updateStats();
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

	// @Override
	draw(parent){
		const rot = this.getTrueRotation(parent) - 90;
		this.drawUnder(parent, rot);
		this.drawWeapons(parent, rot);
		this.drawAbove(parent, rot);
	},

	drawWeapons(parent, rot){
		const lim = Mathf.floor(this.weapons.length / 2);
		var index = 0;
		for(var num = -lim; num < lim; num++){
			if(num != 0 || this.weapons.length % 2 == 1){
				this.drawWeapon(parent, rot, num, index++);
			}
		}
	},

	drawWeapon(parent, rot, num, index){
		const weapon = this.weapons[index];
		// TODO: Use same maths from mother hen to actually move it properly instead of this joke
		// TODO: see if this works and add weapon recoil
		const offsetX = Angles.trnsx(rot + 90, weapon.length, weapon.width * num);
		const offsetY = Angles.trnsy(rot + 90, weapon.length, weapon.width * num);
		Draw.rect(weapon.region, player.x + offsetX, player.y + offsetY, rot);
	},

	drawUnder(parent, rotation){},
	drawAbove(parent, rotation){},

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
		return this.entities[parent.id] = ent;
	},
	getEntity(parent) {
		var ent = this.entities[parent.id];
		if(ent === undefined){
			ent = this.setEntity(parent.id, {
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
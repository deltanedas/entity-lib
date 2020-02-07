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
		var pos = Vec2(pX, pY); // Raw rotation
		pos.sub(shooter.getX(), shooter.getY());
		if(pos.len() < this.minPlayerDist){ // TODO: see if this affects units
			pos.setLength(this.minPlayerDist);
		}
		var cx = pos.x + shooter.getX(), cy = pos.y + shooter.getY();

		var ang = pos.angle();
		if(this.parent.rotationLimit > 0){
			ang = this.parent.getTrueRotation(shooter);
		}
		pos.trns(ang - 90, this.width, this.length);

		// "realUpdate" to avoid bs infinite recursion
		this.realUpdate(shooter, pos.x, pos.y, Angles.angle(shooter.getX() + pos.x, shooter.getY() + pos.y, cx, cy), false);
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
			this.updateStats();
			if(Vars.net.client()){
				this.shootDirect(shooter, x, y, angle, false);
			}else if(this.isMech){
				Call.onPlayerShootWeapon(shooter, x, y, angle, false);
			}else{
				Call.onGenericShootWeapon(shooter, x, y, angle, false);
			}
			this.parent.weapon = this;

			this.parent.updateRecoil(shooter, this.weapon);
			this.parent.onShoot(shooter, this.weapon, x, y, angle);
			this.cycleWeapons();
		}
	},

	cycleWeapons(){
		this.weapon = (this.weapon + 1) % this.parent.weapons.length;
	},

	// Pretend to be current weapon
	updateStats(){
		const weapons = this.parent.weapons;
		const weapon = weapons[this.weapon];
		this.reload = weapon.reload / weapons.length; // Like alternate
		this.shots = weapon.shots;
		const lim = Mathf.floor(weapons.length / 2);
		var index = 0;
		for(var num = -lim; num <= lim; num++){
			if(num != 0 || weapons.length % 2 == 1){
				if(index++ == this.weapon){
					this.width = weapon.width * num;
					break;
				}
			}
		}
		this.length = weapon.length;
	}
};
MultiWeapon.weapon = 0;
MultiWeapon.isMech = null; // Do not modify.
MultiWeapon.bullet = null; // ^

/*
Mech and units pull from this code
Do not extend in your mods.
*/
const state = this;
const Common = {
	// @Override
	init(){
		this.weapon = state.global.entityLib.extendWeapon(Weapon, this);
		this.weapon.updateStats();
		this.entities = [];
		this.initAfter();
	},
	initAfter(){},

	// @Override
	load(){ // YAY I can use load() because it doesn't need super!
		this.weapon.load();
		for (var i = 0; i < this.weapons.length; i++){
			this.weapons[i].load(); // Load its weapons in case you... want to draw them?
		}

		// Prevent parent from drawing stuff at wrong rotation
		// TODO: lobby for shadows and engine light
		this.region = Core.atlas.find("clear");
		this.legRegion = Core.atlas.find("clear");
		this.baseRegion = Core.atlas.find("clear");
		this.loadAfter();
	},
	loadAfter(){},

	// @Override
	draw(parent){
		const rot = (this.getTrueRotation(parent) || 0) - 90;
		this.drawUnder(parent, rot);
		this.drawWeapons(parent, rot);
		this.drawAbove(parent, rot);
	},

	drawWeapons(parent, rot){
		const lim = Mathf.floor(this.weapons.length / 2);
		var index = 0;
		for(var num = -lim; num <= lim; num++){
			if(num != 0 || this.weapons.length % 2 == 1){
				this.drawWeapon(parent, rot, num, index++);
			}
		}
	},

	drawWeapon(parent, rot, num, index){
		const weapon = this.weapons[index];
		const side = Mathf.clamp(-num, -1, 1);

		const offsetX = weapon.width * num + this.weaponOffsetX * side;
		const offsetY = weapon.length + this.weaponOffsetY - this.getRecoil(parent, index);
		const x = Angles.trnsx(rot + 90, offsetY, offsetX);
		const y = Angles.trnsy(rot + 90, offsetY, offsetX);

		Draw.rect(weapon.region,
			parent.x + x, parent.y + y,
			Draw.scl * weapon.region.getWidth() * ((num > 0) ? -1 : 1), // Flip textures on either side
			Draw.scl * weapon.region.getHeight(),
			rot);
	},

	drawUnder(parent, rotation){},
	drawAbove(parent, rotation){},

	// @Override
	drawStats(parent){
		const rot = this.getTrueRotation(parent) || 0;
		if(this.drawCell){
			const health = parent.healthf();
			Draw.color(Color.black, parent.getTeam().color, health + Mathf.absin(Time.time(), health * 5, 1 - health));
			Draw.rect(parent.getPowerCellRegion(),
				parent.x + Angles.trnsx(rot, this.cellTrnsY, 0),
				parent.y + Angles.trnsy(rot, this.cellTrnsY, 0),
				rot - 90);
			Draw.reset();
		}
		const tmp = parent.rotation;
		parent.rotation = rot;
		if(this.drawItems){
			parent.drawBackItems();
		}

		if(this.lightEmitted > 0){
			parent.drawLight(this.lightEmitted);
		}
		parent.rotation = tmp;
	},

	// @Override
	drawShadow(parent, offsetX, offsetY){
		const scale = this.weapon.isMech ? (this.flying ? 1 : parent.boostHeat / 2) : 1; // Units cannot boost, so do not scale them.
		offsetX *= scale;
		offsetY *= scale;

		parent.x += offsetX; // Trick it into drawing at the correct offset;
		parent.y += offsetY;
		this.draw(parent);
		parent.x -= offsetX;
		parent.y -= offsetY;
	},

	onShoot(shooter, weapon, x, y, angle){},

	updateRecoil(player, weapon){
		this.setRecoil(player, weapon, this.weapons[weapon].recoil);
	},
	setRecoil(player, weapon, recoil){
		const ent = this.getEntity(player);
		var recoils = ent.recoil || {};
		recoils[weapon] = recoil;
		ent.recoil = recoils;
		this.setEntity(player, ent);
		return recoil;
	},
	getRecoil(player, weapon){
		return (this.getEntity(player).recoil || {})[weapon] || 0;
	},

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
			ent = this.setEntity(parent, {
				trueRotation: parent.rotation
			});
		}
		return ent;
	}
};
Common.entities = {};
Common.rotationLimit = 0;
Common.rotationLerp = 0.01;
Common.weapons = [];
Common.cellTrnsY = 0;

this.global.entityLib.Common = Common;
this.global.entityLib.MultiWeapon = MultiWeapon
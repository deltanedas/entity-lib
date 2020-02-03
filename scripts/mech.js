const Mechdef = Object.create(this.global.entityLib.Common);
Object.assign(Mechdef, {
	// @Override
	updateAlt(player){
		// Rotation stuff
		if(this.rotationLimit > 0){
			this.setTrueRotation(player, Mathf.slerp(this.getTrueRotation(player), player.rotation, this.rotationLerp));
		}else{
			this.setTrueRotation(player, player.rotation);
		}
		for (var i = 0; i < this.weapons.length; i++){
			const weapon = this.weapons[i];
			if(weapon.recoil > 0){ // Save a bit of CPU
				this.setRecoil(player, i, Mathf.lerp(this.getRecoil(player, i), 0, weapon.recoilRecovery || 1 / (weapon.reload + 1)));
			}
		}
		this.update(player);
	},
	update(player){},

	// @Override
	drawStats(player){
		const rot = this.getTrueRotation(player) || 0;
		if(this.drawCell){
			const health = player.healthf();
			Draw.color(Color.black, player.getTeam().color, health + Mathf.absin(Time.time(), health * 5, 1 - health));
			Draw.rect(player.getPowerCellRegion(),
				player.x + Angles.trnsx(rot, this.cellTrnsY, 0),
				player.y + Angles.trnsy(rot, this.cellTrnsY, 0),
				rot - 90);
			Draw.reset();
		}
		const tmp = player.rotation;
		player.rotation = rot;
		if(this.drawItems){
			player.drawBackItems();
		}
		if(this.drawLight){
			player.drawLight();
		}
		player.rotation = tmp;
	},

	// @Override
	drawShadow(player, offsetX, offsetY){
		const scale = this.flying ? 1 : player.boostHeat / 2;
		offsetX *= scale;
		offsetY *= scale;

		player.x += offsetX; // Trick it into drawing at the correct offset;
		player.y += offsetY;
		this.draw(player);
		player.x -= offsetX;
		player.y -= offsetY;
	},

	// @Override
	drawEngine(player){
		const size = this.engineSize * (this.flying ? 1 : player.boostHeat);
		const rotation = this.getTrueRotation(player);
		Draw.color(this.engineColor);
		Fill.circle(player.x + Angles.trnsx(rotation + 180, this.engineOffset), player.y + Angles.trnsy(rotation + 180, this.engineOffset),
			(size + Mathf.absin(Time.time(), 2, size / 4)) * this.engineRadius);

		Draw.color(this.engineInnerColor);
		Fill.circle(player.x + Angles.trnsx(rotation + 180, this.engineOffset - 1), player.y + Angles.trnsy(rotation + 180, this.engineOffset - 1),
			(size + Mathf.absin(Time.time(), 2, size / 4)) * this.engineInnerRadius);
		Draw.color();
	}
});

this.global.entityLib.Mech = Mechdef;
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
	}
});

this.global.entityLib.Mech = Mechdef;
const Mechdef = Object.create(this.global.entityLib.Common);
Object.assign(Mechdef, {
	// @Override
	updateAlt(player){
		// Rotation stuff
		if(this.rotationLimit > 0){
			var rot = this.getTrueRotation(player);
			if(rot === null){
				rot = player.rotation;
			}
			this.setTrueRotation(player, Mathf.lerp(rot, player.rotation, this.rotationLerp));
		}else{
			this.setTrueRotation(player, player.rotation);
		}
		this.update(player);
	},
	update(player){},

	// @Override
	drawStats(player){
		const rot = this.getTrueRotation(player);
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
const MechDef = Object.create(this.global.entityLib.Common);
Object.assign(MechDef, {
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
	draw: function(player){
		const rot = this.trueRotation(player) - 90;
		this.drawUnder(player, rot);
		this.drawWeapons(player, rot);
		this.drawAbove(player, rot);
	},

	// @Override
	drawStats: function(player){
		const rot = this.trueRotation(player);
		print(this.drawLight)
		print(this.drawLight === true)
		if(this.drawCell){
			const health = player.healthf();
			Draw.color(Color.black, player.getTeam().color, health + Mathf.absin(Time.time(), health * 5, 1 - health));
			Draw.rect(player.getPowerCellRegion(),
				player.x + Angles.trnsx(rot, this.cellTrnsY, 0),
				player.y + Angles.trnsy(rot, this.cellTrnsY, 0),
				rot - 90));
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

this.global.entityLib.Mech = extend(Mech, MechDef);
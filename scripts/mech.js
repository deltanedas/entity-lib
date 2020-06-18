/*
	Copyright (c) DeltaNedas 2020

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
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
import { Pipe, PipeTransform } from '@angular/core';
import { Player } from '../models/player';

@Pipe({
    name: 'playerFilter',
    standalone: false
})
export class PlayerFilterPipe implements PipeTransform {
    transform(players: Player[], searchTerm: string): Player[] {
        if (!players || !searchTerm) {
            return players;
        }

        const term = searchTerm.toLowerCase();

        return players.filter(player =>
            (player.firstName?.toLowerCase().includes(term)) ||
            (player.lastName?.toLowerCase().includes(term)) ||
            (player.position?.toLowerCase().includes(term)) ||
            (player.team?.toLowerCase().includes(term)) ||
            (player.age?.toString().includes(term))
        );
    }
} 
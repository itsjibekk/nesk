import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) return items;

    searchText = searchText.toLowerCase();
    return items.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchText)
      )
    );
  }
}

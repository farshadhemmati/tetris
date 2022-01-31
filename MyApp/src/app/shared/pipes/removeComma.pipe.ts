import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeComma'
})
export class RemoveCommaPipe implements PipeTransform {

  transform(value: any): any {
    return value.replace(new RegExp(',', 'g'), ' ');
  }

}

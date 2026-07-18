import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateUtc',
  standalone: true, 
})
export class DateUtcPipe implements PipeTransform {
   transform(
    value: string | Date | null | undefined,
    type: 'input' | 'utc' | 'withCurrentTime' = 'input'
  ): string | null {

    if (!value) return '';

    if (type === 'input') {
      return this.toInputDate(value);
    }

    if (type === 'utc') {
      return this.toUTCISO(value);
    }
    if (type === 'withCurrentTime') {
    return this.toDateWithCurrentTime(value);
  }

    return '';
  }

  /**
 * Converts a Date or UTC ISO string to "yyyy-MM-dd" format
 * Required by HTML <input type="date">
 */
  private toInputDate(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  /**
 * Converts a Date or UTC ISO string to "dd/MM/yyyy" format for display
 */
  private toUTCISO(inputValue: string | Date): string {
    const date = new Date(inputValue + 'T00:00:00'); // Local midnight
    return date.toISOString();
  }
  private toDateWithCurrentTime(value: string | Date): string {
  const baseDate = value instanceof Date ? value : new Date(value);
  const now = new Date();

  baseDate.setHours(
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  );

  return baseDate.toISOString();
}
}
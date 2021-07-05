import {format} from "date-fns";
import {id} from "date-fns/locale";

export default function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return format(date, "d MMMM yyyy", {locale: id});
}

import { Gtk, astalify, type ConstructProps } from "astal/gtk4";

export type CalendarProps = ConstructProps<Gtk.Calendar, Gtk.Calendar.ConstructorProps>;
export const Calendar = astalify<Gtk.Calendar, Gtk.Calendar.ConstructorProps>(Gtk.Calendar, {});

export type PictureProps = ConstructProps<Gtk.Picture, Gtk.Picture.ConstructorProps>;
export const Picture = astalify<Gtk.Picture, Gtk.Picture.ConstructorProps>(Gtk.Picture, {});

export type SeparatorProps = ConstructProps<Gtk.Separator, Gtk.Separator.ConstructorProps>;
export const Separator = astalify<Gtk.Separator, Gtk.Separator.ConstructorProps>(Gtk.Separator, {});

export type ScrolledWindowProps = ConstructProps<Gtk.ScrolledWindow, Gtk.ScrolledWindow.ConstructorProps>;
export const ScrolledWindow = astalify<Gtk.ScrolledWindow, Gtk.ScrolledWindow.ConstructorProps>(Gtk.ScrolledWindow, {});

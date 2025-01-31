{ ... }:
{
  hardware.sensor.iio = {
    enable = true;
  };

  programs.iio-hyprland = {
    enable = true;
  };

  # accel_3d stops updating after a suspend, forcing a read causes it to update and work.. weird fix but ok
  systemd.services.iio-poller = {
    description = "Polls IIO accelerometer to force updates for auto-rotation";
    wantedBy = [ "multi-user.target" ];
    serviceConfig = {
      Type = "simple";
      ExecStart = "/bin/sh -c 'while true; do cat /sys/bus/iio/devices/iio:device*/in_accel_x_raw > /dev/null; sleep 2; done'";
      Restart = "always";
    };
  };
}

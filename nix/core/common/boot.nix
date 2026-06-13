{ ... }:

{
  boot = {
    blacklistedKernelModules = [ "ntfs3" ];
    supportedFilesystems = [ "ntfs" ];

    loader = {
      systemd-boot.enable = true;
      efi.canTouchEfiVariables = true;
    };
  };
}

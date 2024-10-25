{ ... }:

{
  boot = {
    loader = {
      systemd-boot.enable = true;
      efi.canTouchEfiVariables = true;
    };

    # https://github.com/NixOS/nixpkgs/issues/286028 fix
    kernelModules = [ "nvidia-uvm" ];

    blacklistedKernelModules = [ "ntfs3" ];
    supportedFilesystems = [ "ntfs" ];
  };
}

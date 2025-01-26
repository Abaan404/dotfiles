{ pkgs, ... }:

{
  environment.systemPackages = [
    pkgs.nvtopPackages.amd
    pkgs.nvtopPackages.nvidia
  ];
}

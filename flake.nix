{
  description = "abaan404's NixOS dotfiles";

  inputs = {
    # nixpkgs 
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.05";
    nixpkgs-unstable.url = "github:nixos/nixpkgs/nixos-unstable";
    nixpkgs-master.url = "github:nixos/nixpkgs/master";

    # ags
    ags.url = "github:Aylur/ags";

    # matlab
    matlab = {
      url = "gitlab:doronbehar/nix-matlab";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    # HM config
    home-manager = {
      url = "github:nix-community/home-manager/release-24.05";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    # envycontrol (optimus PRIME)
    envycontrol.url = "github:bayasdev/envycontrol";

    # preconfig hardware
    nixos-hardware.url = "github:NixOS/nixos-hardware/master";
  };

  outputs =
    {
      self,
      nixpkgs,
      nixpkgs-unstable,
      nixpkgs-master,
      nixos-hardware,
      ags,
      matlab,
      home-manager,
      ...
    }@inputs:
    let
      system = "x86_64-linux";

      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
      };

      pkgs-unstable = import nixpkgs-unstable {
        inherit system;
        config.allowUnfree = true;
      };

      pkgs-master = import nixpkgs-master {
        inherit system;
        config.allowUnfree = true;
      };

      flake-overlays = [ matlab.overlay ];
    in
    {
      nixosConfigurations = {
        nixos = nixpkgs.lib.nixosSystem {
          inherit system;

          specialArgs = {
            inherit inputs;
            inherit pkgs-unstable;
            inherit pkgs-master;
          };

          modules = [
            ./nix/configuration.nix
            nixos-hardware.nixosModules.lenovo-ideapad-15arh05 # change for your laptop here!
            "${nixpkgs-master}/nixos/modules/programs/gpu-screen-recorder.nix" # FIXME: remove once gpu-screen-recorder-4.2.3 is merged into stable/unstable
          ];
        };
      };

      homeConfigurations = {
        abaan404 = home-manager.lib.homeManagerConfiguration {
          inherit pkgs;

          extraSpecialArgs = {
            inherit inputs;
            inherit pkgs-unstable;
          };

          modules = [ (import ./nix/home.nix flake-overlays) ];
        };
      };
    };
}

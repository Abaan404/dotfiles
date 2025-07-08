{
  description = "abaan404's NixOS dotfiles";

  inputs = {
    # nixpkgs
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
    nixpkgs-unstable.url = "github:nixos/nixpkgs/nixos-unstable";
    nix-flatpak.url = "github:gmodena/nix-flatpak/?ref=latest";

    # astal/ags
    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    # matlab
    matlab = {
      url = "gitlab:doronbehar/nix-matlab";
      inputs.nixpkgs.follows = "nixpkgs-unstable";
    };

    # HM config
    home-manager = {
      url = "github:nix-community/home-manager/release-24.11";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    # envycontrol (optimus PRIME)
    envycontrol = {
      url = "github:bayasdev/envycontrol";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    # swww-git (FIXME: remove when v0.9.6 has been released)
    swww = {
      url = "github:LGFae/swww";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    # zen-browser (see: https://github.com/NixOS/nixpkgs/pull/363992#pullrequestreview-2523997020)
    zen-browser = {
      url = "github:0xc000022070/zen-browser-flake";
      inputs.nixpkgs.follows = "nixpkgs-unstable";
    };

    # switch-theme
    switch-theme = {
      url = "path:./nix/switch-theme";
      inputs.nixpkgs.follows = "nixpkgs-unstable";
    };

    # preconfig hardware
    nixos-hardware.url = "github:NixOS/nixos-hardware/master";
  };

  outputs =
    {
      nixpkgs,
      nixpkgs-unstable,
      home-manager,
      matlab,
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

      flake-overlays = [ matlab.overlay ];
    in
    {
      nixosConfigurations = {
        asus = nixpkgs.lib.nixosSystem {
          inherit system;

          specialArgs = {
            username = "abaan404";

            inherit inputs;
            inherit pkgs-unstable;
          };

          modules = [
            ./nix/core/common
            ./nix/core/asus
          ];
        };

        lenovo = nixpkgs.lib.nixosSystem {
          inherit system;

          specialArgs = {
            username = "abaan404";

            inherit inputs;
            inherit pkgs-unstable;
          };

          modules = [
            inputs.nixos-hardware.nixosModules.lenovo-ideapad-15arh05
            ./nix/core/common
            ./nix/core/lenovo
          ];
        };
      };

      homeConfigurations = {
        abaan404 = home-manager.lib.homeManagerConfiguration {
          inherit pkgs;

          extraSpecialArgs = {
            username = "abaan404";

            inherit inputs;
            inherit pkgs-unstable;
            inherit flake-overlays;
          };

          modules = [
            inputs.ags.homeManagerModules.default
            inputs.nix-flatpak.homeManagerModules.nix-flatpak

            ./nix/home/home.nix
            {
              programs.git = {
                userName = "abaan404";
                userEmail = "67100191+Abaan404@users.noreply.github.com";
              };
            }
          ];
        };
      };
    };
}

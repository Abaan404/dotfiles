install system:
    # create system-specific config
    mkdir -p ./nix/core/{{system}}
    echo -e '{ ... }:\n\n{\n    imports = [\n        ./hardware-configuration.nix\n    ];\n}' > ./nix/core/{{system}}/default.nix
    cp /etc/nixos/hardware-configuration.nix ./nix/core/{{system}}

    # add a nixosConfigurations entry into flake.nix
    grep -q "{{system}} =" ./flake.nix && exit 0 || awk -v conf={{system}} '1; /nixosConfigurations = {/ {print "        " conf " = nixpkgs.lib.nixosSystem {\n          inherit system;\n\n          specialArgs = {\n            username = \"abaan404\";\n\n            inherit inputs;\n            inherit pkgs-unstable;\n          };\n\n          modules = [\n            ./nix/core/common\n            ./nix/core/" conf "\n          ];\n        };\n"}' ./flake.nix > tmp && mv tmp ./flake.nix

    # add to git bc nix doesnt like it when you dont
    git add ./nix/core/{{system}}/*
    git add ./flake.nix

    # switch to new dots
    just switch-nixos {{system}}
    just switch-hm

    # copy default wallpapers
    install -m 644 -v -D $(readlink -f $(which Hyprland) | cut -c-59)/share/hypr/wall* -t ~/Pictures/wallpapers/
    
    # load configs
    python3 ./scripts/reload.py

    echo "Installation Completed. Run 'Hyprland' as a command to begin"

switch-nixos system:
    sudo nixos-rebuild switch --flake .#{{system}}

switch-hm:
    home-manager switch --flake ~/.dotfiles

test-nixos system:
    sudo nixos-rebuild switch --flake .#{{system}}

rollback:
    sudo nixos-rebuild switch --rollback

update system:
    nix flake update
    just switch-nixos {{system}}
    just switch-hm

gc:
    # why cant both be one command?
    sudo nix-collect-garbage -d
    nix-collect-garbage -d


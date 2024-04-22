function __read_yn {
    echo -en "$1"
    read yn
    yn=$(echo "$yn" | tr A-Z a-z)

    if [[ $yn =~ [yY] ]]; then
        return 0
    elif [[ $yn =~ [nN] ]]; then
        return -1
    elif [[ -z $yn ]]; then
        return $2
    fi

    return -1
}

function install_lenovo_service {
    sudo install -D ~/.dotfiles/systemd/lenovo-profile.service /etc/systemd/system/lenovo-profile.service
    sudo install -D ~/.dotfiles/systemd/lenovo-profile /usr/bin/lenovo-profile

    sudo systemctl enable --now lenovo-profile &
}

function install_hyprlaunch_script {
    install -D ~/.dotfiles/systemd/hyprlaunch ~/.local/bin/hyprlaunch
    install -D ~/.dotfiles/systemd/hyprlaunch.service ~/.config/systemd/user/hyprlaunch.service

    systemctl --user enable hyprlaunch
}

function install_yay {
    if [[ -x $(command -v yay) ]]; then
        return
    fi
    git clone https://aur.archlinux.org/yay.git
    cd yay
    makepkg -si
    cd ..
    rm -rf yay
}

function bootstrap {
    chmod a+x ~/.dotfiles/scripts/*
    mkdir -p ~/Pictures/wallpapers/ && cp /usr/share/hyprland/wall*.png "$_"
}

if __read_yn "THIS SCRIPT CAN POTENTIALLY ERASE EXISTING DATA, THIS IS MEANT TO BE RAN ON A FRESH ARCH LINUX INSTALL!\nIt is also very likey this wont even work, use at your own risk\ncontinue? [y/N] " -1; then
    git clone "https://github.com/abaan404/dotfiles" ~/.dotfiles
else
    exit
fi

if __read_yn "Install \"Lenovo Ideapad Gaming 3\" specific files? (requires sudo) [y/N] " -1; then
    echo "Installing lenovo service..."
    install_lenovo_service
fi

sudo pacman -S --needed --noconfirm \
    base-devel git zsh acpi acpid acpi_call wget \
    networkmanager dhcpcd bluez bluez-utils blueman gnome-bluetooth-3.0 \
    pipewire pipewire-alsa pipewire-audio pipewire-jack pipewire-pulse wireplumber \
    python python-pybluez python-dotenv python-pip python-pywal \
    qt5ct qt5-imageformats qt5-wayland qt6-wayland kvantum \
    rofi rofi-calc dunst hyprland xdg-desktop-portal-hyprland \
    brightnessctl playerctl pamixer tlp jq swayidle \
    grim slurp swappy \
    swayimg dolphin neovim

install_yay
yay -S --needed --noconfirm \
    swaylock-effects swww auto-cpufreq \
    hyprpicker-git pyprland sway-audio-idle-inhibit-git \
    themix-theme-oomox-git python-colorthief \
    tela-icon-theme bibata-cursor-theme-bin ttf-jetbrains-mono-nerd otf-font-awesome nwg-look \
    oh-my-zsh-git zsh-autosuggestions \
    aylurs-gtk-shell bun-bin \
    gpu-screen-recorder-git \
    codelldb

if __read_yn "Install nvidia drivers? [y/N] " -1; then
    sudo pacman -S --needed --noconfirm \
        nvidia nvidia-utils
    if __read_yn "Install envycontrol? (for optimus laptops)"; then
        yay -S envycontrol
    fi
fi

if __read_yn "Install optional packages? [Y/n] "; then
    sudo pacman -S --needed --noconfirm \
        firefox kitty obs-studio discord kate okular steam \
        gimp kolourpaint vlc spotify-launcher \
        pavucontrol-qt neofetch bat htop

    yay -S --needed --noconfirm \
        cava vscodium-bin prismlauncher-qt5-bin # you will play minecraft
fi

if __read_yn "Install wine? [Y/n] "; then
    sudo pacman -S --needed --noconfirm \
        lutris wine-staging wine-mono
fi

# install a hyprland launch wrapper, and a unit file to run on user login
echo "Installing hyprland service..."
install_hyprlaunch_script

echo "Writing .zshrc"
cp ~/.dotfiles/home/.zshrc ~/.zshrc

bootstrap
# run hyprland
if __read_yn "Launch Hyprland? [Y/n] "; then
    ~/.local/bin/hyprlaunch
fi

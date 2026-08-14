# Cinny desktop

<a href="https://github.com/schadin/harrier-desktop/releases">
  <img alt="GitHub release downloads" src="https://img.shields.io/github/downloads/schadin/harrier-desktop/total?style=social"></a>

Cinny is a matrix client focusing primarily on simple, elegant and secure interface. The desktop app is made with Tauri.

## Download

Installers for macOS, Windows and Linux can be downloaded from [Github releases](https://github.com/schadin/harrier-desktop/releases).

Operating System | Download
---|---
Windows | <a href='https://github.com/schadin/harrier-desktop/releases/latest/download/Harrier_desktop-x86_64.msi'>Harrier.msi</a> · <a href='https://scoop.sh/#/apps?q=cinny'>Install via Scoop</a>
macOS | <a href='https://github.com/schadin/harrier-desktop/releases/latest/download/Harrier_desktop-universal.dmg'>Harrier.dmg</a> · <a href='https://github.com/schadin/harrier-desktop/releases/latest/download/Harrier_desktop-universal.app.tar.gz'>Harrier.app</a>
Linux | <a href='https://github.com/schadin/harrier-desktop/releases/latest/download/Harrier_desktop-x86_64.AppImage'>Harrier.AppImage</a> · <a href='https://flathub.org/apps/details/in.cinny.Cinny'>Flatpak</a>

Decoded public key:
> RWRflTUQD3RHFtn25QNANCmePR9+4LSK89kAKTMEEB4OKpOFpLMgc64z

To verify release files, you need to download [minisign](https://jedisct1.github.io/minisign/) tool and [decode](https://www.base64decode.org/) the *.sig* file before running:
>  minisign -Vm ***RELEASE_FILE.msi.zip*** -P RWRflTUQD3RHFtn25QNANCmePR9+4LSK89kAKTMEEB4OKpOFpLMgc64z -x ***Decoded_SINGATURE.msi.zip.sig***

## Local development

Firstly, to setup Rust, NodeJS and build tools follow [Tauri documentation](https://v2.tauri.app/start/prerequisites/).

Now, to setup development locally run the following commands:
* `git clone --recursive https://github.com/schadin/harrier-desktop.git`
* `cd cinny-desktop/cinny`
* `npm ci`
* `cd ..`
* `npm ci`

To build the app locally, run:
* `npm run tauri build`

To start local dev server, run:
* `npm run tauri dev`

; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "Monitor"
#define MyAppVersion "1.0"
#define MyAppPublisher "Ética Tecnologia"
#define MyAppURL "http://38.114.119.39/"
#define MyAppExeName "Monitor.exe"

[Setup]
AppId={{3FFE25B4-8FDD-4EC6-9A96-C0BE2BF87F8F}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName=C:\ETTICA\MONITOR
DisableProgramGroupPage=yes
OutputDir=D:\GITHUB\CLIENTES_CONTINGENCIA\CLIENTE\INSTALADOR MONITOR
OutputBaseFilename=Instalar MONITOR
SetupIconFile=C:\Users\Ezequiel\Downloads\monitor2.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "D:\GITHUB\CLIENTES_CONTINGENCIA\CLIENTE\dist\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\GITHUB\CLIENTES_CONTINGENCIA\CLIENTE\dist\config.ini"; DestDir: "{app}"; Flags: ignoreversion
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"


[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
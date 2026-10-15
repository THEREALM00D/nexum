; Personnalisation de l'installeur NSIS (inclus par electron-builder, voir
; `nsis.include` dans electron-builder.yml).
;
; Par défaut, le désinstalleur d'electron-builder vide TOUT le dossier
; d'installation (`RMDir /r $INSTDIR`), y compris les fichiers que
; l'utilisateur y a rangés. Il tourne aussi à chaque mise à jour (l'installeur
; lance le désinstalleur de l'ancienne version) : un dossier de sauvegarde
; Valheim placé dans H:\Nexum était effacé à chaque mise à jour de Nexum
; (signalé sur Discord, 2026-10-15).
;
; On ne supprime donc que les fichiers de Nexum (liste blanche ci-dessous).
; ⚠️ À revoir à chaque bump majeur d'Electron : comparer avec le contenu de
; dist/win-unpacked. Un fichier oublié reste simplement sur le disque.

!ifdef BUILD_UNINSTALLER
  Var nexumBusyFile

  ; Mise à jour : l'entrée est déplacée dans $PLUGINSDIR\old-install (comme le
  ; désinstalleur d'origine) pour pouvoir tout remettre en place si un fichier
  ; est occupé. Désinstallation : suppression directe.
  ;
  ; ⚠️ Un dossier se vide fichier par fichier (un.atomicRMDir d'electron-
  ; builder) et n'est jamais renommé d'un bloc : $PLUGINSDIR est dans %TEMP%
  ; (C:), et Windows refuse de déplacer un dossier vers un autre lecteur. En
  ; 0.12.4/0.12.5, renommer `resources` d'un bloc échouait pour une install
  ; sur H: ; vu comme « fichier occupé », la mise à jour était annulée en
  ; boucle (« Nexum cannot be closed », signalé sur Discord).
  !macro nexumRemoveEntry NAME
    ${if} ${isUpdated}
      ${if} $nexumBusyFile == ""
        ${if} ${FileExists} "$INSTDIR\${NAME}\*.*"
          CreateDirectory "$PLUGINSDIR\old-install\${NAME}"
          Push "\${NAME}"
          Call un.atomicRMDir
          Pop $R0
          ${if} $R0 != 0
            StrCpy $nexumBusyFile $R0
          ${endif}
        ${elseif} ${FileExists} "$INSTDIR\${NAME}"
          ClearErrors
          Rename "$INSTDIR\${NAME}" "$PLUGINSDIR\old-install\${NAME}"
          ${if} ${Errors}
            StrCpy $nexumBusyFile "$INSTDIR\${NAME}"
          ${endif}
        ${endif}
      ${endif}
    ${else}
      RMDir /r "$INSTDIR\${NAME}"
      Delete "$INSTDIR\${NAME}"
    ${endif}
  !macroend

  !macro nexumForEachEntry MACRO
    !insertmacro ${MACRO} "${APP_EXECUTABLE_FILENAME}"
    !insertmacro ${MACRO} "resources"
    !insertmacro ${MACRO} "locales"
    !insertmacro ${MACRO} "LICENSE.electron.txt"
    !insertmacro ${MACRO} "LICENSES.chromium.html"
    !insertmacro ${MACRO} "chrome_100_percent.pak"
    !insertmacro ${MACRO} "chrome_200_percent.pak"
    !insertmacro ${MACRO} "resources.pak"
    !insertmacro ${MACRO} "d3dcompiler_47.dll"
    !insertmacro ${MACRO} "dxcompiler.dll"
    !insertmacro ${MACRO} "dxil.dll"
    !insertmacro ${MACRO} "ffmpeg.dll"
    !insertmacro ${MACRO} "libEGL.dll"
    !insertmacro ${MACRO} "libGLESv2.dll"
    !insertmacro ${MACRO} "vk_swiftshader.dll"
    !insertmacro ${MACRO} "vulkan-1.dll"
    !insertmacro ${MACRO} "vk_swiftshader_icd.json"
    !insertmacro ${MACRO} "icudtl.dat"
    !insertmacro ${MACRO} "snapshot_blob.bin"
    !insertmacro ${MACRO} "v8_context_snapshot.bin"
  !macroend

  ; Après une mise à jour réussie, il ne reste des dossiers de Nexum que des
  ; coquilles vides (un.atomicRMDir déplace les fichiers, pas les dossiers).
  !macro nexumRemoveEmptyShell NAME
    ${if} ${FileExists} "$INSTDIR\${NAME}\*.*"
      RMDir /r "$INSTDIR\${NAME}"
    ${endif}
  !macroend

  !macro customRemoveFiles
    StrCpy $nexumBusyFile ""
    ${if} ${isUpdated}
      CreateDirectory "$PLUGINSDIR\old-install"
    ${endif}

    !insertmacro nexumForEachEntry nexumRemoveEntry

    ${if} $nexumBusyFile != ""
      ; Un fichier est occupé (Nexum encore ouvert ?) : on remet tout en place
      ; et on abandonne, comme le désinstalleur d'origine. un.restoreFiles
      ; s'appuie sur les coquilles de dossiers encore présentes dans $INSTDIR.
      DetailPrint "File is busy, aborting: $nexumBusyFile"
      Push ""
      Call un.restoreFiles
      Pop $R0
      Abort `Can't rename "$nexumBusyFile" to "$PLUGINSDIR\old-install".`
    ${endif}

    ${if} ${isUpdated}
      !insertmacro nexumForEachEntry nexumRemoveEmptyShell
    ${endif}

    ; Le désinstalleur tourne depuis une copie temporaire : son original peut
    ; être supprimé (l'installeur en réécrit un neuf).
    Delete "$INSTDIR\${UNINSTALL_FILENAME}"
    ; Supprimé seulement s'il est vide : les fichiers de l'utilisateur restent.
    RMDir "$INSTDIR"
  !macroend
!else
  ; Débloque la mise à jour depuis 0.12.4/0.12.5 : leur désinstalleur renomme
  ; des dossiers d'un bloc vers son $PLUGINSDIR, ce qui échoue si celui-ci
  ; (%TEMP%) n'est pas sur le même lecteur que l'install. On lui fournit donc
  ; un dossier temporaire à côté de l'install, sur le même lecteur : le
  ; désinstalleur est lancé par l'installeur et hérite de ses variables
  ; d'environnement. Sans effet gênant pour les autres versions.
  Var nexumTmpDir
  Var nexumOldTemp
  Var nexumOldTmp

  !macro customInit
    Push $0
    Push $1
    Push $2
    StrCpy $nexumTmpDir ""
    ReadRegStr $0 SHELL_CONTEXT "${INSTALL_REGISTRY_KEY}" InstallLocation
    ${if} $0 != ""
      ; Lettre de lecteur de l'install et de %TEMP% (comparaison sans casse).
      StrCpy $1 $0 2
      StrCpy $2 $TEMP 2
      ${if} $1 != $2
        ClearErrors
        CreateDirectory "$0.update-tmp"
        ${ifNot} ${Errors}
          StrCpy $nexumTmpDir "$0.update-tmp"
          ReadEnvStr $nexumOldTemp TEMP
          ReadEnvStr $nexumOldTmp TMP
          System::Call 'kernel32::SetEnvironmentVariable(t "TEMP", t "$nexumTmpDir")'
          System::Call 'kernel32::SetEnvironmentVariable(t "TMP", t "$nexumTmpDir")'
        ${endif}
      ${endif}
    ${endif}
    Pop $2
    Pop $1
    Pop $0
  !macroend

  ; Après la désinstallation de l'ancienne version : on remet %TEMP% en place
  ; (avant le lancement de l'app) et on supprime le dossier temporaire.
  !macro customInstall
    ${if} $nexumTmpDir != ""
      System::Call 'kernel32::SetEnvironmentVariable(t "TEMP", t "$nexumOldTemp")'
      System::Call 'kernel32::SetEnvironmentVariable(t "TMP", t "$nexumOldTmp")'
      RMDir /r "$nexumTmpDir"
      StrCpy $nexumTmpDir ""
    ${endif}
  !macroend
!endif

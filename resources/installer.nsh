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
  !macro nexumRemoveEntry NAME
    ${if} ${FileExists} "$INSTDIR\${NAME}"
      ${if} ${isUpdated}
        ${if} $nexumBusyFile == ""
          ClearErrors
          Rename "$INSTDIR\${NAME}" "$PLUGINSDIR\old-install\${NAME}"
          ${if} ${Errors}
            StrCpy $nexumBusyFile "$INSTDIR\${NAME}"
          ${endif}
        ${endif}
      ${else}
        RMDir /r "$INSTDIR\${NAME}"
        Delete "$INSTDIR\${NAME}"
      ${endif}
    ${endif}
  !macroend

  !macro customRemoveFiles
    StrCpy $nexumBusyFile ""
    ${if} ${isUpdated}
      CreateDirectory "$PLUGINSDIR\old-install"
    ${endif}

    !insertmacro nexumRemoveEntry "${APP_EXECUTABLE_FILENAME}"
    !insertmacro nexumRemoveEntry "resources"
    !insertmacro nexumRemoveEntry "locales"
    !insertmacro nexumRemoveEntry "LICENSE.electron.txt"
    !insertmacro nexumRemoveEntry "LICENSES.chromium.html"
    !insertmacro nexumRemoveEntry "chrome_100_percent.pak"
    !insertmacro nexumRemoveEntry "chrome_200_percent.pak"
    !insertmacro nexumRemoveEntry "resources.pak"
    !insertmacro nexumRemoveEntry "d3dcompiler_47.dll"
    !insertmacro nexumRemoveEntry "dxcompiler.dll"
    !insertmacro nexumRemoveEntry "dxil.dll"
    !insertmacro nexumRemoveEntry "ffmpeg.dll"
    !insertmacro nexumRemoveEntry "libEGL.dll"
    !insertmacro nexumRemoveEntry "libGLESv2.dll"
    !insertmacro nexumRemoveEntry "vk_swiftshader.dll"
    !insertmacro nexumRemoveEntry "vulkan-1.dll"
    !insertmacro nexumRemoveEntry "vk_swiftshader_icd.json"
    !insertmacro nexumRemoveEntry "icudtl.dat"
    !insertmacro nexumRemoveEntry "snapshot_blob.bin"
    !insertmacro nexumRemoveEntry "v8_context_snapshot.bin"

    ${if} $nexumBusyFile != ""
      ; Un fichier est occupé (Nexum encore ouvert ?) : on remet tout en place
      ; et on abandonne, comme le désinstalleur d'origine.
      DetailPrint "File is busy, aborting: $nexumBusyFile"
      Push ""
      Call un.restoreFiles
      Pop $R0
      Abort `Can't rename "$nexumBusyFile" to "$PLUGINSDIR\old-install".`
    ${endif}

    ; Le désinstalleur tourne depuis une copie temporaire : son original peut
    ; être supprimé (l'installeur en réécrit un neuf).
    Delete "$INSTDIR\${UNINSTALL_FILENAME}"
    ; Supprimé seulement s'il est vide : les fichiers de l'utilisateur restent.
    RMDir "$INSTDIR"
  !macroend
!endif

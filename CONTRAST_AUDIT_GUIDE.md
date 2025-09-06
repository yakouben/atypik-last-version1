# 🎨 Guide d'Audit de Contraste - AtypikHouse

## 📋 **Étape 1: Installation de l'Extension**

### **Extension Recommandée: axe DevTools**
1. Ouvrez Chrome
2. Allez sur: https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd
3. Cliquez "Ajouter à Chrome"
4. Confirmez l'installation

### **Extension Alternative: Colour Contrast Analyser**
- Lien: https://chrome.google.com/webstore/detail/colour-contrast-analyser/dagdlcijhfbmgkjokkjicnnfimlebcll

## 🔍 **Étape 2: Comment Utiliser axe DevTools**

1. **Ouvrir votre site** (localhost:3000)
2. **F12** pour ouvrir DevTools
3. **Onglet "axe DevTools"** (nouvel onglet ajouté)
4. **Cliquer "Scan ALL of my page"**
5. **Regarder la section "Color contrast"**

## 🎯 **Pages à Tester**

### **Pages Prioritaires:**
- ✅ **Page d'accueil** (`/`)
- ✅ **Dashboard client** (`/dashboard/client`)
- ✅ **Dashboard propriétaire** (`/dashboard/owner`)
- ✅ **Page de connexion** (`/auth/login`)
- ✅ **Page de propriété** (`/properties/[id]`)

## 📊 **Ratios de Contraste Requis**

### **WCAG 2.1 Standards:**
- **AA Normal (minimum):** 4.5:1
- **AA Large (18pt+):** 3:1
- **AAA Normal (idéal):** 7:1
- **AAA Large (18pt+):** 4.5:1

## 🔧 **Couleurs Actuelles à Vérifier**

### **Couleurs Principales:**
```css
/* Vert principal */
#4A7C59 - Utilisé pour boutons, badges
#2C3E37 - Vert foncé pour textes

/* Textes gris */
text-gray-600 (#4B5563)
text-gray-500 (#6B7280)
text-gray-400 (#9CA3AF)
```

### **Combinaisons à Tester:**
1. **Texte vert sur fond blanc:** `#4A7C59` sur `#FFFFFF`
2. **Texte gris sur fond blanc:** `#6B7280` sur `#FFFFFF`
3. **Texte blanc sur vert:** `#FFFFFF` sur `#4A7C59`
4. **Badges de statut:** Toutes les combinaisons `bg-*-100 text-*-800`

## 🚨 **Problèmes Potentiels Identifiés**

### **Susceptibles d'Échouer:**
- `text-gray-500` (#6B7280) - Ratio: ~4.1:1 ❌ (Sous le minimum AA)
- `text-gray-400` (#9CA3AF) - Ratio: ~2.8:1 ❌ (Très faible)
- Texte vert clair sur fond blanc

## ✅ **Plan de Correction**

### **Solutions Préparées:**
1. **Assombrir les gris:** `text-gray-500` → `text-gray-600`
2. **Renforcer le vert:** `#4A7C59` → `#3D6B4A` (plus foncé)
3. **Améliorer les badges:** Augmenter le contraste des couleurs de statut

## 📝 **Checklist d'Audit**

- [ ] Extension installée
- [ ] Page d'accueil testée
- [ ] Dashboard client testé
- [ ] Dashboard propriétaire testé
- [ ] Page de connexion testée
- [ ] Page de propriété testée
- [ ] Corrections appliquées
- [ ] Re-test après corrections

## 🎯 **Prochaines Étapes**

1. **Installer l'extension**
2. **Tester chaque page**
3. **Noter les erreurs de contraste**
4. **Appliquer les corrections**
5. **Re-tester pour validation**

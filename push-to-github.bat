@echo off
echo 🚀 Pushing CloneSite to GitHub...
echo.

echo 📁 Current directory: %cd%
echo.

echo 🔗 Adding GitHub remote repository...
git remote add origin https://github.com/ronen9/cloneSite.git

echo.
echo 🌟 Setting main branch...
git branch -M main

echo.
echo ⬆️ Pushing to GitHub...
git push -u origin main

echo.
echo ✅ Done! Your repository should now be available at:
echo 🌐 https://github.com/ronen9/cloneSite
echo.
pause
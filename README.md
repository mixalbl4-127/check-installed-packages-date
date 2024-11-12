# check-installed-packages-date
The script checks project dependencies to find recently updated packages that might have broken the build. It reads installed versions from `node_modules`, retrieves their release dates from npm, and shows how many days ago each was updated. This helps quickly identify potential causes of build issues.

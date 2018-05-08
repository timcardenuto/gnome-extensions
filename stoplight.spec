Name:           stoplight
Version:        0.1
Release:        1%{?dist}
Summary:        Green, Yellow, Red

License:        GPLv3+
URL:            https://github.com/timcardenuto/gnome-extensions/tree/master/stoplight%40localhost.localdomain
Source0:        %{name}-%{version}.tar.gz

BuildRequires: gnome-shell

%description
Simple Gnome extension example of a dropdown menu & unix/tcp socket connections.

%prep
echo "Unpack source tar"
tar -zxf %{SOURCE0}

%build

%install
mkdir -p -m0755 %{buildroot}/usr/share/gnome-shell/extensions
mkdir -p -m0755 %{buildroot}/usr/share/icons/gnome/16x16/stoplight
cp -r %{_builddir}/stoplight@localhost.localdomain %{buildroot}/usr/share/gnome-shell/extensions/
cp -r %{_builddir}/stoplight@localhost.localdomain/icons %{buildroot}/usr/share/icons/gnome/16x16/stoplight

%clean
rm -rf %{buildroot}
rm -rf %{_builddir}/*

%post
echo "Enabling Gnome extension"
gsettings set org.gnome.shell enabled-extensions "['stoplight@localhost.localdomain']"

%files
%defattr(-,root,root,-)
/usr/share/gnome-shell/extensions/stoplight@localhost.localdomain
/usr/share/icons/gnome/16x16/stoplight

%preun
#echo "the pre-uninstall sh commands"

%postun
#echo "the post-uninstall sh commands"

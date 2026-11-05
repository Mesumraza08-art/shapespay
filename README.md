# ShapesPay website

Static HTML site with one PHP script for the forms. There is no build step: the repository root is the website root.

## Deploy on Hostinger

1. In hPanel, open **Websites > your site > Advanced > Git**.
2. Add `https://github.com/Mesumraza08-art/shapespay.git`, branch `main`, and leave the install path empty so files go to `public_html`. A private repository also needs the deploy key hPanel shows.
3. Click **Deploy**. To publish future pushes automatically, turn on **Auto Deployment** and add its webhook URL to the GitHub repository.
4. Confirm SSL is active for the domain, because `.htaccess` sends all traffic to `https://shapespay.com`.

## After deploying

- Submit the quote form on `/contact-us/` and confirm the email reaches `Info@Shapespay.com`.
- The `no-reply@shapespay.com` sender must be allowed to send for the domain. If mail goes to spam or never arrives, check the SPF record in Hostinger's DNS settings.

## Forms

`assets/site.js` posts both forms to `api/lead.php`, which emails them to the address at the top of that file. Submissions are not stored anywhere else. If sending fails, the visitor sees an error with the phone number.

## Editing CSS or JS

Browsers cache `assets/site.css` and `assets/site.js` for one hour, so changes can take that long to reach returning visitors.

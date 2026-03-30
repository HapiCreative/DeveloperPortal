import Link from "next/link";

const footerLinks = {
  Products: [
    { href: "/products", label: "All Products" },
    { href: "/products?status=beta", label: "Beta Products" },
    { href: "/products?status=coming_soon", label: "Coming Soon" },
  ],
  Resources: [
    { href: "/docs", label: "Documentation" },
    { href: "/guides", label: "Guides" },
    { href: "/changelog", label: "Changelog" },
    { href: "/status", label: "Status" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Three-column links */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground">
                {category}
              </h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-2 border-t border-border pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} DevPortal. All rights reserved.
          </p>
          <p className="text-sm text-muted">
            Built with ❤️ for developers
          </p>
        </div>
      </div>
    </footer>
  );
}

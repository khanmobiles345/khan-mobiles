import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SITE_NAME = 'Khan Mobile Shop';
const SITE_URL = 'https://www.khanmobiles.store';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

const SEO = ({ title, description, path = '', image, noindex = false, structuredData }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Premium Mobile Accessories`;
  const url = `${SITE_URL}${path}`;
  const ogImage = image || DEFAULT_IMAGE;
  const siteSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': SITE_URL + '/#organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: SITE_URL + '/favicon.svg' },
      },
      {
        '@type': 'WebSite',
        '@id': SITE_URL + '/#website',
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { '@id': SITE_URL + '/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: SITE_URL + '/shop?search={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <script type="application/ld+json">
        {JSON.stringify(siteSchema)}
      </script>

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string.isRequired,
  path: PropTypes.string,
  image: PropTypes.string,
  noindex: PropTypes.bool,
  structuredData: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
};

export default SEO;

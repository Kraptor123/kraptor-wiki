import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
    {
        title: 'Cs-Kraptor',
        imgSrc: '/img/kraptorlogo.png',
        description: (
            <>
                Cs-Kraptor sadece Türk kullanıcıları ilgilendiren eklentileri barındıran ana repodur.
            </>
        ),
    },
    {
        title: 'Cs-Karma',
        imgSrc: '/img/cskarma.png',
        description: (
            <>
                Cs-Karma eklentileri türlerine takılmadan karma şekilde yüklenen birden çok ülkeye destek veren yan repodur.
            </>
        ),
    },
    {
        title: 'Gizli Keyif',
        imgSrc: '/img/gizlikeyifogo.png',
        description: (
            <>
                Bunu boşverin.
            </>
        ),
    },
];

function Feature({imgSrc, title, description}) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <img src={imgSrc} className={styles.featureSvg} alt={title} />
            </div>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

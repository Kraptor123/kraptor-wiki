import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
    {
        title: 'Cs-Kraptor',
        imgSrc: './img/kraptorlogo.png',
        link: 'https://github.com/Kraptor123/cs-kraptor',
        description: (
            <>
                Cs-Kraptor sadece Türk kullanıcıları ilgilendiren eklentileri barındıran ana repodur.
            </>
        ),
    },
    {
        title: 'Cs-Karma',
        imgSrc: './img/cskarma.png',
        link: 'https://github.com/Kraptor123/Cs-Karma',
        description: (
            <>
                Cs-Karma eklentileri türlerine takılmadan karma şekilde yüklenen birden çok ülkeye destek veren yan repodur.
            </>
        ),
    },
];

function Feature({imgSrc, title, description, link}) {
    return (
        <div className={clsx('col col--6')}>
            <div className="text--center">
                <a href={link} target="_blank" rel="noopener noreferrer">
                    <img src={imgSrc} className={styles.featureSvg} alt={title} />
                </a>
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
                <div className="row justify-content--center">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
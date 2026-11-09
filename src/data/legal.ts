import { site } from './site';

export type LegalSection = {
  heading: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
};

export const legalContent = {
  es: {
    privacy: {
      title: 'Política de privacidad',
      updated: 'Última actualización: 4 de noviembre de 2026',
      intro:
        'En Windytech respetamos tu privacidad. Esta política explica qué datos recopilamos, cómo los usamos y qué puedes hacer al respecto.',
      sections: [
        {
          heading: 'Qué datos recopilamos',
          paragraphs: [
            'Recopilamos la información que nos compartes cuando nos contactas por WhatsApp, correo electrónico o formularios:',
          ],
          bullets: [
            'Datos de contacto: nombre, número de teléfono y correo electrónico.',
            'Información del negocio: nombre, actividad y necesidades del proyecto.',
            'Detalles del servicio: mensajes, requisitos, archivos y referencias que nos envías.',
          ],
        },
        {
          heading: 'Para qué usamos tus datos',
          bullets: [
            'Responder a tus consultas y preparar cotizaciones.',
            'Prestar los servicios contratados y coordinar entregas.',
            'Enviarte actualizaciones relacionadas con tu proyecto.',
            'Cumplir obligaciones legales, contables y fiscales.',
            'Mejorar nuestros servicios y la experiencia del sitio.',
          ],
        },
        {
          heading: 'Con quién compartimos tu información',
          paragraphs: [
            'No vendemos tus datos. Podemos compartirlos con freelancers o proveedores que participan en tu proyecto bajo acuerdos de confidencialidad, y con plataformas de pago cuando sea necesario para procesar una operación.',
          ],
        },
        {
          heading: 'Cookies y analítica',
          paragraphs: [
            'El sitio puede usar herramientas de analítica para entender cómo se usa y mejorar su contenido. No usamos cookies publicitarias por defecto. Si activamos campañas con seguimiento, actualizaremos esta política.',
          ],
        },
        {
          heading: 'Seguridad',
          paragraphs: [
            'Aplicamos medidas razonables para proteger tu información. Ningún sistema es completamente seguro, por lo que no podemos garantizar seguridad absoluta.',
          ],
        },
        {
          heading: 'Tus derechos',
          paragraphs: [
            `Puedes solicitar acceso, corrección o eliminación de tus datos personales escribiéndonos a ${site.email} o por WhatsApp al ${site.whatsappDisplay}.`,
          ],
        },
        {
          heading: 'Cambios a esta política',
          paragraphs: [
            'Podemos actualizar esta política cuando cambien nuestras prácticas o la normativa aplicable. Publicaremos la versión vigente en esta página con su fecha de actualización.',
          ],
        },
      ],
    },
    terms: {
      title: 'Términos y condiciones',
      updated: 'Última actualización: 4 de noviembre de 2026',
      intro:
        'Estos términos regulan el uso de este sitio y la contratación de servicios. Al solicitar una cotización o contratar un servicio, aceptas estas condiciones.',
      sections: [
        {
          heading: 'Uso del sitio',
          paragraphs: [
            'El contenido de este sitio es informativo. Hacemos un esfuerzo razonable por mantener la información actualizada, pero no garantizamos que esté libre de errores u omisiones.',
          ],
        },
        {
          heading: 'Cotizaciones y alcance',
          paragraphs: [
            'Cada cotización describe el alcance, los entregables y el precio del servicio. Las cotizaciones tienen una vigencia de 15 días salvo que se indique lo contrario. Cualquier cambio de alcance se cotiza por separado antes de ejecutarse.',
          ],
        },
        {
          heading: 'Pagos',
          paragraphs: [
            'Salvo que se acuerde otra cosa por escrito, los proyectos requieren un anticipo del 50% para iniciar. El saldo se paga contra entrega o según los hitos definidos en la propuesta. Aceptamos Binance y PayPal. Las comisiones de las plataformas de pago corren por cuenta del cliente cuando apliquen.',
          ],
        },
        {
          heading: 'Plazos y entregas',
          paragraphs: [
            'Los plazos dependen del alcance, la complejidad y la colaboración del cliente. Los retrasos causados por falta de información, aprobaciones o materiales del cliente no se computan como retraso nuestro.',
          ],
        },
        {
          heading: 'Revisiones',
          paragraphs: [
            'La propuesta indica cuántas rondas de revisión están incluidas. Los cambios adicionales o los ajustes fuera del alcance se cotizan por separado.',
          ],
        },
        {
          heading: 'Propiedad intelectual',
          paragraphs: [
            'Una vez recibido el pago completo, el cliente es dueño de los entregables finales acordados. Windytech conserva la propiedad de su código base, frameworks, herramientas internas y componentes reutilizables. Las licencias de terceros se rigen por sus propios términos.',
          ],
        },
        {
          heading: 'Equipos informáticos',
          paragraphs: [
            'La disponibilidad, el precio y el tiempo de entrega de los equipos se confirman al momento de la cotización. La garantía se rige por las condiciones del fabricante o proveedor. No prometemos plazos ni existencias hasta que la cotización esté confirmada.',
          ],
        },
        {
          heading: 'Cancelaciones',
          paragraphs: [
            'El anticipo no es reembolsable una vez iniciado el trabajo, salvo que se acuerde lo contrario por escrito. Si el cliente cancela, se le entregará el trabajo realizado hasta ese momento y se podrá aplicar un crédito por la parte no ejecutada.',
          ],
        },
        {
          heading: 'Confidencialidad',
          paragraphs: [
            'Ambas partes se comprometen a proteger la información confidencial compartida durante el proyecto y a no divulgarla sin autorización, salvo cuando la ley lo exija.',
          ],
        },
        {
          heading: 'Limitación de responsabilidad',
          paragraphs: [
            'En la medida permitida por la ley, nuestra responsabilidad total se limita al monto pagado por el servicio contratado. No respondemos por daños indirectos, lucro cesante o pérdida de datos que no sean consecuencia directa de nuestro trabajo.',
          ],
        },
        {
          heading: 'Ley aplicable',
          paragraphs: [
            'Estos términos se rigen por las leyes de la República Bolivariana de Venezuela. Las partes buscarán resolver cualquier disputa de buena fe y, de no ser posible, se someterán a los tribunales competentes.',
          ],
        },
        {
          heading: 'Contacto',
          paragraphs: [
            `Para preguntas sobre estos términos, escríbenos a ${site.email} o por WhatsApp al ${site.whatsappDisplay}.`,
          ],
        },
      ],
    },
  },
  en: {
    privacy: {
      title: 'Privacy policy',
      updated: 'Last updated: November 4, 2026',
      intro:
        'At Windytech we respect your privacy. This policy explains what data we collect, how we use it and what you can do about it.',
      sections: [
        {
          heading: 'What data we collect',
          paragraphs: [
            'We collect the information you share with us when you contact us through WhatsApp, email or forms:',
          ],
          bullets: [
            'Contact details: name, phone number and email address.',
            'Business information: business name, activity and project needs.',
            'Service details: messages, requirements, files and references you send us.',
          ],
        },
        {
          heading: 'How we use your data',
          bullets: [
            'To respond to your inquiries and prepare quotes.',
            'To provide the services you hire and coordinate deliveries.',
            'To send you updates related to your project.',
            'To comply with legal, accounting and tax obligations.',
            'To improve our services and the website experience.',
          ],
        },
        {
          heading: 'Who we share information with',
          paragraphs: [
            'We do not sell your data. We may share it with freelancers or providers involved in your project under confidentiality agreements, and with payment platforms when necessary to process a transaction.',
          ],
        },
        {
          heading: 'Cookies and analytics',
          paragraphs: [
            'The site may use analytics tools to understand how it is used and improve its content. We do not use advertising cookies by default. If we run campaigns with tracking, we will update this policy.',
          ],
        },
        {
          heading: 'Security',
          paragraphs: [
            'We apply reasonable measures to protect your information. No system is completely secure, so we cannot guarantee absolute security.',
          ],
        },
        {
          heading: 'Your rights',
          paragraphs: [
            `You can request access to, correction of, or deletion of your personal data by writing to ${site.email} or via WhatsApp at ${site.whatsappDisplay}.`,
          ],
        },
        {
          heading: 'Changes to this policy',
          paragraphs: [
            'We may update this policy when our practices or applicable regulations change. We will publish the current version on this page with its update date.',
          ],
        },
      ],
    },
    terms: {
      title: 'Terms and conditions',
      updated: 'Last updated: November 4, 2026',
      intro:
        'These terms govern the use of this site and the contracting of services with Windytech. By requesting a quote or hiring a service, you accept these conditions.',
      sections: [
        {
          heading: 'Use of the site',
          paragraphs: [
            'The content of this site is informational. We make a reasonable effort to keep the information current, but we do not guarantee that it is free of errors or omissions.',
          ],
        },
        {
          heading: 'Quotes and scope',
          paragraphs: [
            'Each quote describes the scope, deliverables and price of the service. Quotes are valid for 15 days unless otherwise stated. Any change in scope is quoted separately before it is executed.',
          ],
        },
        {
          heading: 'Payments',
          paragraphs: [
            'Unless otherwise agreed in writing, projects require a 50% deposit to start. The balance is paid on delivery or according to the milestones defined in the proposal. We accept Binance and PayPal. Payment platform fees are borne by the client where applicable.',
          ],
        },
        {
          heading: 'Timelines and deliveries',
          paragraphs: [
            'Timelines depend on scope, complexity and client collaboration. Delays caused by missing client information, approvals or materials are not counted as our delay.',
          ],
        },
        {
          heading: 'Revisions',
          paragraphs: [
            'The proposal states how many revision rounds are included. Additional changes or adjustments outside the scope are quoted separately.',
          ],
        },
        {
          heading: 'Intellectual property',
          paragraphs: [
            'Once full payment is received, the client owns the agreed final deliverables. Windytech retains ownership of its base code, frameworks, internal tools and reusable components. Third-party licenses are governed by their own terms.',
          ],
        },
        {
          heading: 'IT equipment',
          paragraphs: [
            'Equipment availability, price and delivery time are confirmed at the time of quoting. Warranty is governed by the manufacturer or supplier conditions. We do not promise timelines or stock until the quote is confirmed.',
          ],
        },
        {
          heading: 'Cancellations',
          paragraphs: [
            'The deposit is non-refundable once work has started, unless otherwise agreed in writing. If the client cancels, the work completed up to that point will be delivered and a credit may be applied for the unexecuted portion.',
          ],
        },
        {
          heading: 'Confidentiality',
          paragraphs: [
            'Both parties agree to protect confidential information shared during the project and not to disclose it without authorization, except where required by law.',
          ],
        },
        {
          heading: 'Limitation of liability',
          paragraphs: [
            'To the extent permitted by law, our total liability is limited to the amount paid for the contracted service. We are not liable for indirect damages, lost profits or data loss that is not a direct consequence of our work.',
          ],
        },
        {
          heading: 'Governing law',
          paragraphs: [
            'These terms are governed by the laws of the Bolivarian Republic of Venezuela. The parties will seek to resolve any dispute in good faith and, failing that, submit to the competent courts.',
          ],
        },
        {
          heading: 'Contact',
          paragraphs: [
            `For questions about these terms, write to ${site.email} or via WhatsApp at ${site.whatsappDisplay}.`,
          ],
        },
      ],
    },
  },
} as const;

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link
                    href="/"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ChevronLeft className="size-4 mr-1" />
                    Back to Home
                </Link>

                <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
                <p className="text-muted-foreground mb-8">Last updated: March 24, 2026</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing or using Flowforge.systems (&quot;Service&quot;), you agree to be bound by these Terms of Service.
                            If you disagree with any part of these terms, you may not access the Service. Our AI-powered solutions
                            and software development services are provided subject to these terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Flowforge.systems provides artificial intelligence solutions, machine learning models, software development
                            services, and related technology consulting. Our services include but are not limited to:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li>Custom AI/ML model development and deployment</li>
                            <li>Natural language processing solutions</li>
                            <li>Computer vision and image recognition systems</li>
                            <li>Predictive analytics and data science consulting</li>
                            <li>API integrations and automation workflows</li>
                            <li>Full-stack software development</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When you create an account with us, you must provide accurate, complete, and current information.
                            You are responsible for safeguarding the password and for all activities that occur under your account.
                            You agree to notify us immediately of any unauthorized access or use of your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The Service and its original content, features, and functionality are owned by Flowforge.systems
                            and are protected by international copyright, trademark, patent, trade secret, and other intellectual
                            property laws. Custom solutions developed for clients remain the property of the respective clients
                            upon full payment, unless otherwise specified in a separate agreement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. AI-Specific Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Our AI services are provided &quot;as-is&quot; and may produce outputs that require human review. You acknowledge that:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li>AI-generated content may not always be accurate or appropriate for your specific use case</li>
                            <li>You are responsible for reviewing and validating AI outputs before use in production</li>
                            <li>We do not guarantee specific accuracy rates or performance metrics unless contractually agreed</li>
                            <li>AI models may be updated or improved, which could affect output consistency</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You agree not to use our Service to:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li>Generate harmful, misleading, or illegal content</li>
                            <li>Infringe upon intellectual property rights of others</li>
                            <li>Attempt to reverse engineer or extract our proprietary models</li>
                            <li>Overload or disrupt our infrastructure</li>
                            <li>Violate any applicable laws or regulations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Payment and Billing</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Certain services may require payment. You agree to provide accurate billing information and authorize
                            us to charge the applicable fees. All fees are non-refundable unless otherwise specified. We reserve
                            the right to modify pricing with 30 days notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            In no event shall Flowforge.systems, its directors, employees, partners, agents, suppliers, or
                            affiliates be liable for any indirect, incidental, special, consequential, or punitive damages,
                            including loss of profits, data, or other intangible losses, resulting from your use of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may terminate or suspend your account immediately, without prior notice or liability, for any
                            reason, including breach of these Terms. Upon termination, your right to use the Service will
                            immediately cease.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to modify these terms at any time. We will notify users of any material changes
                            via email or through the Service. Continued use after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <p className="text-foreground mt-2">
                            <strong>Email:</strong> contact@flowforge.systems
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

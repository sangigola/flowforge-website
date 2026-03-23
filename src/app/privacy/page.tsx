import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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

                <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">Last updated: March 24, 2026</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            At Flowforge.systems, we take your privacy seriously. This Privacy Policy explains how we collect,
                            use, disclose, and safeguard your information when you use our AI solutions and software development
                            services. Please read this policy carefully to understand our practices regarding your personal data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li><strong>Account Information:</strong> Name, email address, phone number, and authentication credentials</li>
                            <li><strong>Communication Data:</strong> Messages, inquiries, and feedback you send to us</li>
                            <li><strong>Usage Data:</strong> Information about how you interact with our services</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies</li>
                            <li><strong>AI Interaction Data:</strong> Prompts, inputs, and outputs from AI model interactions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We use the collected information for:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li>Providing, maintaining, and improving our AI and software services</li>
                            <li>Processing transactions and sending related information</li>
                            <li>Responding to your comments, questions, and support requests</li>
                            <li>Training and improving our AI models (with anonymized data only)</li>
                            <li>Sending technical notices, updates, and security alerts</li>
                            <li>Detecting, preventing, and addressing technical issues and fraud</li>
                            <li>Complying with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. AI Data Processing</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When you use our AI-powered services, we may process:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li>Input data you provide to AI models</li>
                            <li>Generated outputs and responses</li>
                            <li>Feedback and corrections you provide</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            We implement strict data handling practices for AI processing, including data minimization,
                            encryption, and access controls. Your data is not used to train general-purpose models
                            without explicit consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may share your information with:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our services</li>
                            <li><strong>Business Partners:</strong> With your consent, for joint offerings</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            We do not sell your personal information to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We implement industry-standard security measures including:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li>End-to-end encryption for data in transit and at rest</li>
                            <li>Regular security audits and penetration testing</li>
                            <li>Access controls and authentication mechanisms</li>
                            <li>Secure development practices and code reviews</li>
                            <li>Incident response and breach notification procedures</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We retain your personal information only for as long as necessary to fulfill the purposes
                            outlined in this policy, unless a longer retention period is required by law. AI interaction
                            data is typically retained for 90 days for quality improvement purposes, after which it is
                            anonymized or deleted.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Depending on your location, you may have the following rights:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                            <li><strong>Deletion:</strong> Request deletion of your data</li>
                            <li><strong>Portability:</strong> Request transfer of your data</li>
                            <li><strong>Objection:</strong> Object to certain processing activities</li>
                            <li><strong>Restriction:</strong> Request limitation of processing</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            To exercise these rights, please contact us at contact@flowforge.systems.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We use cookies and similar tracking technologies to collect information about your browsing
                            activities. You can control cookies through your browser settings. Essential cookies are
                            required for the Service to function properly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Your information may be transferred to and processed in countries other than your own.
                            We ensure appropriate safeguards are in place for such transfers, including standard
                            contractual clauses and adequacy decisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">11. Children&apos;s Privacy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Our Service is not directed to children under 16. We do not knowingly collect personal
                            information from children. If you believe we have collected data from a child, please
                            contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any changes
                            by posting the new policy on this page and updating the &quot;Last updated&quot; date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have questions about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="mt-4 space-y-2">
                            <p className="text-foreground">
                                <strong>Email:</strong> contact@flowforge.systems
                            </p>
                            <p className="text-foreground">
                                <strong>Website:</strong> flowforge.systems
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

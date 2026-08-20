import { Request, Response } from "express";
import MembershipForm from "../models/MembershipForm";
import sendEmail from "../utils/sendEmail";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createMembershipForm = async (req: Request, res: Response) => {
    try {
        const { name, email, tel, address, signature, date } = req.body;
        if (![name, email, tel, address, signature, date].every(Boolean) || !EMAIL.test(String(email))) {
            return res.status(400).json({ message: "Name, valid email, telephone, address, signature and date are required" });
        }

        const form = await MembershipForm.create(req.body);
        const details = [
            `Name: ${form.name}`,
            `Email: ${form.email}`,
            `Telephone: ${form.tel}`,
            `Address: ${form.address}`,
            form.designation && `Designation: ${form.designation}`,
            form.dateOfEmployment && `Date of employment: ${form.dateOfEmployment.toISOString().slice(0, 10)}`,
            form.section && `Section: ${form.section}`,
            form.qualification && `Qualification: ${form.qualification}`,
            form.licenseNo && `License number: ${form.licenseNo}`,
            form.employer && `Employer: ${form.employer}`,
            form.rank && `Rank: ${form.rank}`,
            `Submitted: ${form.date.toISOString().slice(0, 10)}`,
        ].filter(Boolean).join("\n");

        // Email delivery is a side effect; a temporary provider outage must not lose
        // or misreport an application that has already been stored successfully.
        Promise.allSettled([
            sendEmail({
                to: process.env.MEMBERSHIP_ADMIN_EMAIL || "info@naape.org.ng",
                subject: "New NAAPE Membership Application",
                text: details,
            }),
            sendEmail({
                to: form.email,
                subject: "NAAPE Membership Form Received",
                text: `Hello ${form.name},\n\nYour membership application has been received. We will contact you shortly.\n\nNAAPE Secretariat`,
            }),
        ]).then((results) => results.forEach((result) => {
            if (result.status === "rejected") console.error("Membership email failed:", result.reason);
        }));

        return res.status(201).json({
            message: "Your membership application has been received",
            applicationId: form._id,
        });
    } catch (error: any) {
        return res.status(400).json({ message: error.message || "Failed to submit membership form" });
    }
};

export const getAllMembershipForms = async (_req: Request, res: Response) => {
    const forms = await MembershipForm.find().sort({ createdAt: -1 });
    res.json({ count: forms.length, data: forms });
};

export const getMembershipFormById = async (req: Request, res: Response) => {
    const form = await MembershipForm.findById(req.params.id);
    if (!form) return res.status(404).json({ message: "Membership form not found" });
    res.json({ data: form });
};

export const updateMembershipForm = async (req: Request, res: Response) => {
    const form = await MembershipForm.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!form) return res.status(404).json({ message: "Membership form not found" });
    res.json({ message: "Membership form updated", data: form });
};

export const deleteMembershipForm = async (req: Request, res: Response) => {
    const form = await MembershipForm.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ message: "Membership form not found" });
    res.status(204).send();
};
